export function formatEmail(report: any) {
    let output = "";
  
    output += "🌍 GLOBAL INTELLIGENCE REPORT\n";
    output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
  
    output += `🧠 Executive Summary:\n${report.summary}\n\n`;
  
    for (const region of report.regions) {
      output += region.critical
        ? `🚨 ${region.name.toUpperCase()}\n`
        : `🌎 ${region.name}\n`;
  
      output += "────────────────────────────\n";
  
      for (const event of region.events) {
        const emoji =
          event.severity === "HIGH"
            ? "🔴"
            : event.severity === "MEDIUM"
            ? "🟠"
            : "🟢";
  
        output += `${emoji} ${event.title}\n`;
        output += `   ${event.brief}\n\n`;
      }
  
      output += "\n";
    }
  
    output += "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    output += `Generated at: ${new Date().toUTCString()}\n`;
  
    return output;
  }