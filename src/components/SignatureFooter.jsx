import React from "react";
import { ArrowUpRight, Linkedin, Mail } from "lucide-react";

export function SignatureFooter() {
  return (
    <footer className="signature-footer">
      <div className="footer-smoke" aria-hidden="true" />
      <div className="footer-divider" />
      <div className="signature-panel">
        <div>
          <p className="eyebrow">Creator signature</p>
          <h2>Designed and directed by Mohammad Al-Ajmi</h2>
          <p>Created by Mohammad Al-Ajmi</p>
        </div>
        <div className="footer-links">
          <a href="mailto:ajmi.198599@gmail.com">
            <Mail size={18} />
            ajmi.198599@gmail.com
            <ArrowUpRight size={16} />
          </a>
          <a href="https://www.linkedin.com/in/mohammad-ajmi" target="_blank" rel="noreferrer">
            <Linkedin size={18} />
            linkedin.com/in/mohammad-ajmi
            <ArrowUpRight size={16} />
          </a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>OBSIDIAN ESSENCE</span>
        <span>Extrait de Parfum</span>
      </div>
    </footer>
  );
}
