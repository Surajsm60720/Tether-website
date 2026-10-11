import { useEffect, useRef, useState } from 'react';
import IPhoneMockup from './ui/iphone-mockup';
import './PhoneFrame.css';

export type PhoneScreen =
  | 'hosts'
  | 'files'
  | 'preview'
  | 'send'
  | 'terminal'
  | 'monitor'
  | 'agent'
  | 'transfers';

interface Props {
  screen?: PhoneScreen;
  dark?: boolean;
  /** Outer frame width in px. Omit to fill the parent slot. */
  width?: number;
}

function StatusBar({ dark, compact }: { dark?: boolean; compact?: boolean }) {
  return (
    <div className={`phone-status${dark ? ' is-dark' : ''}${compact ? ' is-compact' : ''}`}>
      <span className="time">9:41</span>
      <span className="trailing" aria-hidden="true">
        {!compact && (
          <>
            <i className="signal" />
            <i className="wifi" />
          </>
        )}
        <i className="battery" />
      </span>
    </div>
  );
}

/**
 * Compact Live Activity around the camera cutout:
 * left = agent icon, right = status word (Thinking, Editing, …).
 */
function AgentIslandStatus() {
  return (
    <div className="phone-island-live" aria-hidden="true">
      <div className="phone-island-leading">
        <span className="phone-island-icon is-code">&lt;/&gt;</span>
        <span className="phone-island-icon is-claude">C</span>
        <span className="phone-island-icon is-cursor">Cu</span>
        <span className="phone-island-icon is-gemini">G</span>
      </div>
      <div className="phone-island-cutout-gap" />
      <div className="phone-island-trailing">
        <span className="phone-island-word is-thinking">Thinking</span>
        <span className="phone-island-word is-editing">Editing</span>
        <span className="phone-island-word is-working">Working</span>
        <span className="phone-island-word is-needs">Needs you</span>
      </div>
    </div>
  );
}

function ScreenBody({ screen, dark }: { screen: PhoneScreen; dark?: boolean }) {
  if (screen === 'hosts') {
    return (
      <div className="phone-ui">
        <h4>Your Macs</h4>
        <div className="card">
          <span className="dot pulse" />
          <div>
            <strong>Studio Mac</strong>
            <small>Connected</small>
          </div>
        </div>
        <div className="card muted">
          <span className="dot dim" />
          <div>
            <strong>Office Mac</strong>
            <small>Available</small>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'files') {
    return (
      <div className="phone-ui">
        <h4>Projects</h4>
        <div className="file">
          <span className="glyph doc" />
          <div>
            <strong>brief.pdf</strong>
            <small>Today · 2.4 MB</small>
          </div>
        </div>
        <div className="file">
          <span className="glyph img" />
          <div>
            <strong>hero.png</strong>
            <small>Yesterday · 1.1 MB</small>
          </div>
        </div>
        <div className="file">
          <span className="glyph folder" />
          <div>
            <strong>Exports</strong>
            <small>12 items</small>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'preview') {
    return (
      <div className="phone-ui preview">
        <div className="pdf">
          <div className="bar" />
          <div className="line w80" />
          <div className="line w60" />
          <div className="line w90" />
          <div className="line w50" />
          <div className="line w70" />
        </div>
        <p>brief.pdf</p>
      </div>
    );
  }

  if (screen === 'send') {
    return (
      <div className="phone-ui">
        <h4>Send</h4>
        <button className="fake-btn" type="button">
          Photos
        </button>
        <button className="fake-btn secondary" type="button">
          Files
        </button>
        <p className="hint">Lands in Inbox on your Mac</p>
      </div>
    );
  }

  if (screen === 'terminal') {
    return (
      <div className="phone-ui">
        <div className="term">
          <div className="term-top">
            Studio Mac <span>· Live</span>
          </div>
          <pre>
            <span className="p">studio:/Projects $</span> ls{'\n'}
            <span className="d">Exports/</span>  brief.pdf{'\n'}
            <span className="p">studio:/Projects $</span> <span className="cursor">█</span>
          </pre>
        </div>
      </div>
    );
  }

  if (screen === 'monitor') {
    const cores = [
      ['C1', '37%'],
      ['C2', '12%'],
      ['C3', '28%'],
      ['C4', '9%'],
      ['C5', '22%'],
      ['C6', '15%'],
      ['C7', '31%'],
      ['C8', '6%'],
    ] as const;

    return (
      <div className="phone-ui">
        <div className="term monitor">
          <div className="term-top">
            Studio Mac <span>· Live</span>
          </div>

          <div className="mon-label">
            <span className="p">$</span> fetch
          </div>
          <div className="mon-fetch">
            <div className="mon-fetch-mark" aria-hidden="true" />
            <dl>
              <div>
                <dt>OS</dt>
                <dd>macOS 15.1</dd>
              </div>
              <div>
                <dt>CPU</dt>
                <dd>M3 · 8 cores</dd>
              </div>
              <div>
                <dt>Mem</dt>
                <dd>24 GB</dd>
              </div>
              <div>
                <dt>Up</dt>
                <dd>21h 4m</dd>
              </div>
              <div>
                <dt>Disk</dt>
                <dd>245 / 460 GB</dd>
              </div>
              <div>
                <dt>Shares</dt>
                <dd>3</dd>
              </div>
            </dl>
          </div>

          <div className="mon-label">
            <span className="p">$</span> htop
          </div>
          <div className="mon-live">
            <div className="mon-sec-head">
              <span>CPU</span>
              <em>14%</em>
            </div>
            <div className="mon-seg" aria-hidden="true">
              <i className="user" style={{ width: '9%' }} />
              <i className="system" style={{ width: '6%' }} />
              <i className="idle" />
            </div>
            <div className="mon-cores" aria-hidden="true">
              {cores.map(([label, pct]) => (
                <div key={label} className="mon-core">
                  <span>{label}</span>
                  <div className="mon-core-bar">
                    <i style={{ width: pct }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mon-meters">
              <div className="mon-meter-row">
                <span>Mem</span>
                <div className="mon-meter mem">
                  <i style={{ width: '67%' }} />
                </div>
                <em>16G</em>
              </div>
              <div className="mon-meter-row">
                <span>Disk</span>
                <div className="mon-meter disk">
                  <i style={{ width: '53%' }} />
                </div>
                <em>245G</em>
              </div>
            </div>
            <ul className="mon-procs">
              <li>
                <span className="d">WindowServer</span>
                <em>9%</em>
              </li>
              <li>
                <span className="d">node</span>
                <em>4%</em>
              </li>
              <li>
                <span className="d">claude</span>
                <em>3%</em>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'agent') {
    return (
      <div className="phone-ui">
        <div className="term agent">
          <div className="term-top">
            Studio Mac <span>· Agent</span>
          </div>
          <div className="agent-slot">
            <div className="agent-slot-head">
              <span className="agent-name">claude</span>
              <span className="agent-state">Needs you</span>
            </div>
            <pre className="agent-stream">
              <span className="p">$</span> claude{'\n'}
              <span className="agent-dim">Allowlisted · live PTY</span>
              {'\n\n'}
              <span className="agent-line">Reading Projects/brief.md…</span>
              {'\n'}
              <span className="agent-line delay-1">Drafting a short summary.</span>
              {'\n'}
              <span className="agent-line delay-2">Proposed edit to README:</span>
              {'\n'}
              <span className="agent-code delay-3">+ Ship local preview notes</span>
              {'\n\n'}
              <span className="agent-ask delay-4">Apply this change?</span>
              {'\n'}
              <span className="agent-prompt delay-5">
                <span className="p">›</span> <span className="cursor">█</span>
              </span>
            </pre>
            <div className="agent-actions" aria-hidden="true">
              <span className="agent-btn">Deny</span>
              <span className="agent-btn primary">Allow</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="phone-ui">
      <h4>Transfers</h4>
      <div className="xfer">
        <strong>hero.png</strong>
        <div className="meter">
          <i style={{ width: '72%' }} />
        </div>
        <small>12.4 MB/s · 8 s left</small>
      </div>
    </div>
  );
}

export default function PhoneFrame({ screen = 'hosts', dark = false, width }: Props) {
  const slotRef = useRef<HTMLDivElement>(null);
  const [slotWidth, setSlotWidth] = useState(width ?? 248);

  useEffect(() => {
    if (width != null) {
      setSlotWidth(width);
      return;
    }
    const el = slotRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const w = entry.contentRect.width;
      if (w > 0) setSlotWidth(w);
    });
    ro.observe(el);
    setSlotWidth(el.clientWidth || 248);
    return () => ro.disconnect();
  }, [width]);

  const isAgent = screen === 'agent';

  return (
    <div ref={slotRef} className="phone-slot" style={{ width: width != null ? width : '100%' }}>
      <IPhoneMockup
        model="15-pro"
        color="#202023"
        width={slotWidth}
        screenBg={dark ? 'var(--term-bg, #0c0c0e)' : '#f2f2f7'}
        showHomeIndicator
        homeIndicatorColor={dark ? 'rgba(242,238,230,0.78)' : 'rgba(29,29,31,0.82)'}
        showSideButtons
        statusBar={<StatusBar dark={dark} compact={isAgent} />}
        dynamicIsland={isAgent ? <AgentIslandStatus /> : undefined}
        shadow
        frameStyle={{
          background: 'linear-gradient(145deg, #2a2a2e 0%, #202023 40%, #18181b 100%)',
        }}
      >
        <ScreenBody screen={screen} dark={dark} />
      </IPhoneMockup>
    </div>
  );
}
