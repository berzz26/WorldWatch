function escapeHtml(value: string | undefined | null): string {
    if (!value) return "";
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function formatEmail(report: any) {
    const generatedAt = new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
    });
    const regions: any[] = Array.isArray(report?.regions) ? report.regions : [];

    const indiaRegions = regions.filter(
        (r) => typeof r?.name === "string" && r.name.toLowerCase().includes("india")
    );
    const otherRegions = regions.filter(
        (r) => !indiaRegions.includes(r)
    );

    const renderRegion = (region: any, accent: "india" | "critical" | "normal") => {
        const events: any[] = Array.isArray(region?.events) ? region.events : [];

        const borderColor =
            accent === "india"
                ? "#ff9933"
                : accent === "critical"
                    ? "#e53935"
                    : "#e0e0e0";
        const headerBg =
            accent === "india"
                ? "#fff3e0"
                : accent === "critical"
                    ? "#ffebee"
                    : "#f5f5f5";

        const items = events
            .map((event) => {
                const sev = String(event?.severity ?? "").toUpperCase();
                const color =
                    sev === "HIGH" ? "#e53935" : sev === "MEDIUM" ? "#fb8c00" : "#43a047";
                const url =
                    typeof event?.url === "string" && event.url
                        ? event.url
                        : typeof event?.link === "string" && event.link
                            ? event.link
                            : "";

                return `
          <li style="margin: 0 0 12px 0;">
            <div style="font-size:14px; line-height:1.4;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:6px;"></span>
              <strong>${escapeHtml(event?.title)}</strong>
            </div>
            <div style="font-size:13px;color:#555;margin-left:16px;margin-top:2px;">
              ${escapeHtml(event?.brief)}
            </div>
            ${url
                        ? `<div style="font-size:12px;margin-left:16px;margin-top:2px;">
                     <a href="${escapeHtml(
                            url
                        )}" style="color:#1565c0;text-decoration:none;">
                       Read original source
                     </a>
                   </div>`
                        : ""
                    }
          </li>
        `;
            })
            .join("");

        return `
      <section style="border:1px solid ${borderColor};border-radius:8px;margin:16px 0;overflow:hidden;">
        <div style="background:${headerBg};padding:10px 14px;">
          <h2 style="margin:0;font-size:16px;font-weight:600;color:#222;">
            ${accent === "india" ? "🇮🇳 India" : escapeHtml(region?.name)}
            ${region?.critical && accent !== "india"
                ? '<span style="color:#e53935;font-size:12px;margin-left:6px;">(Critical)</span>'
                : ""}
          </h2>
        </div>
        <div style="padding:12px 16px;">
          ${items ||
            '<p style="margin:0;font-size:13px;color:#666;">No major updates in this region today.</p>'
            }
        </div>
      </section>
    `;
    };

    const indiaHtml = indiaRegions
        .map((r) => renderRegion(r, "india"))
        .join("");

    const otherHtml = otherRegions
        .map((r) => renderRegion(r, r?.critical ? "critical" : "normal"))
        .join("");

    const html = `
  <div style="background:#f4f4f7;padding:16px 0;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:10px;border:1px solid #e0e0e0;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="padding:20px 24px 12px 24px;border-bottom:1px solid #eee;">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#111;"> Global Intelligence Report</h1>
        <p style="margin:4px 0 0 0;font-size:12px;color:#666;">Generated at ${escapeHtml(
          generatedAt
        )}</p>
      </div>

      <div style="padding:18px 24px 10px 24px;">
        <h2 style="margin:0 0 8px 0;font-size:16px;font-weight:600;color:#222;">Executive Summary</h2>
        <p style="margin:0;font-size:14px;line-height:1.6;color:#333;">
          ${escapeHtml(report?.summary)}
        </p>
      </div>

      <div style="padding:0 24px 20px 24px;">
        ${indiaHtml ||
        '<section style="border:1px solid #ff9933;border-radius:8px;margin:16px 0;overflow:hidden;"><div style="background:#fff3e0;padding:10px 14px;"><h2 style="margin:0;font-size:16px;font-weight:600;color:#222;">🇮🇳 India</h2></div><div style="padding:12px 16px;"><p style="margin:0;font-size:13px;color:#666;">No major India updates today.</p></div></section>'
        }
        ${otherHtml}
      </div>
    </div>
  </div>
  `;

    return html;
}