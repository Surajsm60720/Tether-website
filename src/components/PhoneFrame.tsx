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
  | 'transfers';

interface Props {
  screen?: PhoneScreen;
  dark?: boolean;
  /** Outer frame width in px. Omit to fill the parent slot. */
  width?: number;
}

function StatusBar({ dark }: { dark?: boolean }) {
  return (
    <div className={dark ? 'phone-status is-dark' : 'phone-status'}>
      <span className="time">9:41</span>
      <span className="trailing" aria-hidden="true">
        <i className="signal" />
        <i className="wifi" />
        <i className="battery" />
      </span>
    </div>
  );
}

function ScreenBody({ screen, dark }: { screen: PhoneScreen; dark?: boolean }) {
  if (screen === 'hosts') {
    return (
      <div className="phone-ui">
        <h4>Your Macs</h4>
        <div className="card">
          <span className="dot" />
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
    return (
      <div className="phone-ui">
        <div className="term monitor">
          <div className="term-top">
            Studio Mac <span>· Live</span>
          </div>
          <div className="mon-block">
            <div className="mon-cmd">
              <span className="p">$</span> fetch
            </div>
            <div className="mon-fetch">
              <div className="mon-mark" aria-hidden="true" />
              <dl>
                <div>
                  <dt>Host</dt>
                  <dd>Studio Mac</dd>
                </div>
                <div>
                  <dt>OS</dt>
                  <dd>macOS 15.1</dd>
                </div>
                <div>
                  <dt>CPU</dt>
                  <dd>M2 Pro · 10c</dd>
                </div>
                <div>
                  <dt>Mem</dt>
                  <dd>32 GB</dd>
                </div>
                <div>
                  <dt>Up</dt>
                  <dd>4d 11h</dd>
                </div>
              </dl>
            </div>
          </div>
          <div className="mon-block">
            <div className="mon-cmd">
              <span className="p">$</span> htop
            </div>
            <div className="mon-htop">
              <div className="mon-row">
                <span>CPU</span>
                <div className="mon-bars" aria-hidden="true">
                  <i style={{ ['--h' as string]: '62%' }} />
                  <i style={{ ['--h' as string]: '38%' }} />
                  <i style={{ ['--h' as string]: '84%' }} />
                  <i style={{ ['--h' as string]: '21%' }} />
                  <i style={{ ['--h' as string]: '55%' }} />
                  <i style={{ ['--h' as string]: '47%' }} />
                </div>
                <em>41%</em>
              </div>
              <div className="mon-row">
                <span>Mem</span>
                <div className="mon-meter" aria-hidden="true">
                  <i style={{ width: '68%' }} />
                </div>
                <em>21.7G</em>
              </div>
              <div className="mon-row">
                <span>Disk</span>
                <div className="mon-meter soft" aria-hidden="true">
                  <i style={{ width: '44%' }} />
                </div>
                <em>412G</em>
              </div>
              <ul className="mon-procs">
                <li>
                  <span className="d">node</span>
                  <em>18%</em>
                </li>
                <li>
                  <span className="d">WindowServer</span>
                  <em>9%</em>
                </li>
                <li>
                  <span className="d">claude</span>
                  <em>7%</em>
                </li>
              </ul>
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
        statusBar={<StatusBar dark={dark} />}
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
