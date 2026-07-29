import { Icon } from '@/components/ui/Icon'
import { Section, SectionAside, SectionHead } from '@/components/ui/Section'
import { AGENT_JOBS, CHANNEL_DETAIL, FEED } from '@/data/content'
import { c } from '@/lib/theme'
import { useApp } from '@/state/store'

export function Companion() {
  const app = useApp()

  // Alerts fall back to Email when their preferred channel is switched off.
  const feed = FEED.filter((f) => !app.dismissed.includes(f.id)).map((f) => ({
    ...f,
    channel: app.channels[f.channel] ? f.channel : 'Email',
    done: app.resolved.includes(f.id),
  }))

  return (
    <Section id="companion" background={c.dark}>
      <SectionHead
        dark
        eyebrow="Live trip companion"
        title="While you travel, the agent keeps checking — and tells you what to change."
        titleMaxWidth={640}
        marginBottom={36}
        aside={
          <SectionAside dark maxWidth={360}>
            Once a plan is booked it stops being a document. The companion follows it day by day
            and reaches you on the channel you choose.
          </SectionAside>
        }
      />

      <div
        data-grid="split"
        style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 22, alignItems: 'start' }}
      >
        {/* Alert feed */}
        <div
          style={{
            background: c.darkCard,
            border: '1px solid rgba(255,255,255,.1)',
            borderRadius: 22,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '18px 22px',
              borderBottom: '1px solid rgba(255,255,255,.09)',
              flexWrap: 'wrap',
            }}
          >
            <span
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 10,
                height: 10,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: c.green,
                  animation: 'csPulse 2s ease-out infinite',
                }}
              />
              <span
                style={{ width: 8, height: 8, borderRadius: '50%', background: c.green }}
              />
            </span>
            <span style={{ fontSize: 15.5, fontWeight: 600, color: '#fff' }}>
              {app.companionOn ? 'Companion active' : 'Companion preview'} · day 4 of 11
            </span>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.5)' }}>
              Watching 6 bookings, 5 stops, 2 coasts
            </span>

            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {app.channelNames.map((name) => {
                const on = app.channels[name]
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => app.toggleChannel(name)}
                    aria-pressed={on}
                    style={{
                      padding: '6px 13px',
                      borderRadius: 999,
                      border: `1px solid ${on ? c.green : 'rgba(255,255,255,.2)'}`,
                      background: on ? 'rgba(0,197,128,.16)' : 'transparent',
                      color: on ? c.green : 'rgba(255,255,255,.6)',
                      fontSize: 12.5,
                      fontWeight: 500,
                      cursor: 'pointer',
                    }}
                  >
                    {name}
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {feed.map((f) => (
              <div
                key={f.id}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '18px 22px',
                  borderBottom: '1px solid rgba(255,255,255,.07)',
                }}
              >
                <div
                  style={{
                    flex: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    width: 56,
                  }}
                >
                  <span
                    style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.5)' }}
                  >
                    {f.time}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      background: f.iconBg,
                      color: f.iconColor,
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {f.mark}
                  </span>
                </div>

                <div
                  style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 15.5, fontWeight: 600, color: '#fff' }}>
                      {f.title}
                    </span>
                    <span
                      style={{
                        padding: '3px 9px',
                        borderRadius: 5,
                        background: 'rgba(255,255,255,.09)',
                        color: 'rgba(255,255,255,.7)',
                        fontSize: 11,
                        fontWeight: 500,
                        letterSpacing: 0.3,
                        textTransform: 'uppercase',
                      }}
                    >
                      {f.source}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>
                      via {f.channel}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: 14.5,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,.72)',
                      maxWidth: 640,
                    }}
                  >
                    {f.body}
                  </p>

                  {f.done ? (
                    <span style={{ fontSize: 12.5, fontWeight: 500, color: c.green }}>
                      {f.resolvedLabel}
                    </span>
                  ) : (
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                      <button
                        type="button"
                        onClick={() => app.acceptAlert(f.id)}
                        data-hover="primary"
                        style={{
                          padding: '7px 14px',
                          border: 'none',
                          borderRadius: 8,
                          background: c.primary,
                          color: '#fff',
                          fontSize: 12.5,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        {f.acceptLabel}
                      </button>
                      <button
                        type="button"
                        onClick={() => app.dismissAlert(f.id)}
                        data-hover="light-strong"
                        style={{
                          padding: '7px 14px',
                          border: '1px solid rgba(255,255,255,.22)',
                          borderRadius: 8,
                          background: 'transparent',
                          color: 'rgba(255,255,255,.8)',
                          fontSize: 12.5,
                          fontWeight: 500,
                          cursor: 'pointer',
                        }}
                      >
                        Keep as planned
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '16px 22px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,.45)' }}>
              {app.resolved.length} of {FEED.length} suggestions actioned · every change is logged
              and reversible
            </span>
            <button
              type="button"
              onClick={app.openVoice}
              data-hover="light-strong"
              style={{
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                height: 38,
                padding: '0 16px',
                border: '1px solid rgba(255,255,255,.22)',
                borderRadius: 8,
                background: 'transparent',
                color: '#fff',
                fontSize: 13.5,
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <Icon name="Mood" size={16} />
              Talk to the guide
            </button>
          </div>
        </div>

        {/* Jobs + channels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              background: c.darkCard,
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 22,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 6 }}>
              What the agent actually does
            </div>
            <p
              style={{
                marginBottom: 18,
                fontSize: 13.5,
                lineHeight: 1.6,
                color: 'rgba(255,255,255,.55)',
              }}
            >
              Named jobs, not a black box. Each one runs on a schedule and only messages you when
              something changes.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {AGENT_JOBS.map((job) => (
                <div key={job.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span
                    style={{
                      flex: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 26,
                      height: 26,
                      borderRadius: 8,
                      background: job.bg,
                      color: job.color,
                    }}
                  >
                    <Icon name={job.icon} size={15} />
                  </span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 500, color: '#fff' }}>
                      {job.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'rgba(255,255,255,.55)',
                      }}
                    >
                      {job.note}
                    </div>
                    <div
                      style={{
                        fontSize: 11.5,
                        fontWeight: 500,
                        color: c.yellow,
                        marginTop: 3,
                      }}
                    >
                      {job.cadence}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: c.darkCard,
              border: '1px solid rgba(255,255,255,.1)',
              borderRadius: 22,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 14 }}>
              Reach you on
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {app.channelNames.map((name) => {
                const on = app.channels[name]
                return (
                  <div
                    key={name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      padding: '12px 14px',
                      borderRadius: 12,
                      background: on ? 'rgba(0,197,128,.08)' : 'rgba(255,255,255,.03)',
                      border: `1px solid ${on ? 'rgba(0,197,128,.28)' : 'rgba(255,255,255,.08)'}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#fff' }}>{name}</div>
                      <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,.5)' }}>
                        {CHANNEL_DETAIL[name]}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => app.toggleChannel(name)}
                      role="switch"
                      aria-checked={on}
                      aria-label={`${name} notifications`}
                      style={{
                        flex: 'none',
                        width: 44,
                        height: 24,
                        border: 'none',
                        borderRadius: 999,
                        background: on ? c.green : 'rgba(255,255,255,.18)',
                        cursor: 'pointer',
                        padding: 3,
                        display: 'flex',
                        justifyContent: on ? 'flex-end' : 'flex-start',
                        transition: 'background .18s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#fff',
                          display: 'block',
                        }}
                      />
                    </button>
                  </div>
                )
              })}
            </div>
            <p
              style={{
                marginTop: 14,
                fontSize: 12,
                lineHeight: 1.5,
                color: 'rgba(255,255,255,.4)',
              }}
            >
              Safety alerts always go out on every enabled channel, even at night. Everything else
              respects quiet hours 22:00–07:00.
            </p>
          </div>
        </div>
      </div>
    </Section>
  )
}
