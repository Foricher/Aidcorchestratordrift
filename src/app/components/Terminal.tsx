import { useEffect, useRef, useState } from "react";
import { Terminal as XTerminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";

interface TerminalProps {
  terminalId: string;
}

export function Terminal({ terminalId }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<XTerminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Create terminal instance
    const term = new XTerminal({
      cols: 120,
      rows: 30,
      fontSize: 13,
      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace",
      lineHeight: 1.2,
      letterSpacing: 0,
      cursorBlink: true,
      cursorStyle: 'block',
      theme: {
        background: "#0d1117",
        foreground: "#c9d1d9",
        cursor: "#79c0ff",
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    // Append terminal to DOM
    term.open(terminalRef.current);
    fitAddon.fit();

    terminalInstanceRef.current = term;
    fitAddonRef.current = fitAddon;

    // Write welcome message
    term.write("\x1b[1;32m# SSH Terminal\x1b[0m\r\n");
    term.write(
      "\x1b[36mConnected to: localhost\r\n\x1b[0m"
    );
    term.write("Type commands below or connect to a remote SSH host\r\n\r\n");
    term.write("\x1b[1;33m$ \x1b[0m");

    setIsConnected(true);

    // Handle input
    let buffer = "";
    term.onData((data) => {
      if (data === "\r") {
        term.write(`\r\n\x1b[1;33m$ \x1b[0m`);
        buffer = "";
      } else if (data === "\u007F") {
        // Backspace
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          term.write("\b \b");
        }
      } else {
        buffer += data;
        term.write(data);
      }
    });

    // Handle window resize
    const handleResize = () => {
      try {
        fitAddon.fit();
      } catch (e) {
        // Ignore fit errors
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      term.dispose();
    };
  }, [terminalId]);

  return (
    <div
      ref={terminalRef}
      className="w-full h-full bg-gray-950 overflow-hidden"
    />
  );
}
