import React, { useState } from 'react';

const V = {
  primary: 'var(--text-primary)',
  secondary: 'var(--text-secondary)',
  muted: 'var(--text-muted)',
  dim: 'var(--text-dim)',
  card: 'var(--bg-card)',
  surface: 'var(--bg-surface)',
  void: 'var(--bg-void)',
  border: 'var(--border)',
  borderLit: 'var(--border-lit)',
  green: 'var(--green)',
  red: 'var(--red)',
  amber: 'var(--amber)',
  cyan: 'var(--cyan)',
  accent: 'var(--accent)',
};

const INITIAL_RULES = [
  {
    id: 'rule_mr_01',
    name: 'Algorithmic Financial Integrity',
    target: 'order_size',
    operator: '>',
    threshold: '1000000',
    action: 'BLOCK',
    description: 'Intercepts and blocks high-value automated financial transactions without manual approval override.',
    enabled: true,
  },
  {
    id: 'rule_mr_02',
    name: 'Model Bias Guardrail',
    target: 'age_discrimination_score',
    operator: '>',
    threshold: '0.75',
    action: 'WARN',
    description: 'Warns downstream systems if age discrimination probability index spikes in recommendation models.',
    enabled: true,
  },
  {
    id: 'rule_mr_03',
    name: 'Data Leak Interception',
    target: 'pii_density_count',
    operator: '>',
    threshold: '0',
    action: 'BLOCK',
    description: 'Sovereign local interceptor to prevent any raw SSN or tax ID transmission to third-party endpoints.',
    enabled: true,
  },
  {
    id: 'rule_mr_04',
    name: 'Toxicity/Sarcasm Interception',
    target: 'toxicity_score',
    operator: '>',
    threshold: '0.85',
    action: 'AUDIT',
    description: 'Performs passive, lightweight hash audit of toxic response sequences.',
    enabled: false,
  },
];

export default function ConstitutionEditor() {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [activeRule, setActiveRule] = useState(INITIAL_RULES[0]);
  const [yamlContent, setYamlContent] = useState(generateYAML(INITIAL_RULES[0]));
  const [feedback, setFeedback] = useState(null);

  function generateYAML(rule) {
    return `# Anchor Sovereign Rule Declaration v5.0
metadata:
  rule_id: "${rule.id}"
  name: "${rule.name}"
  schema_version: "5.0.0"

interceptor:
  target_field: "${rule.target}"
  trigger:
    operator: "${rule.operator}"
    value: ${rule.threshold}
  
action:
  type: "${rule.action}"
  remediation:
    alert_ciso: true
    seal_audit_header: true
    decouple_payload: true
`;
  }

  const handleSelectRule = (rule) => {
    setActiveRule(rule);
    setYamlContent(generateYAML(rule));
    setFeedback(null);
  };

  const handleSave = () => {
    // Parse simulated YAML fields back
    const lines = yamlContent.split('\n');
    let name = activeRule.name;
    let target = activeRule.target;
    let operator = activeRule.operator;
    let threshold = activeRule.threshold;
    let action = activeRule.action;

    lines.forEach(line => {
      if (line.includes('name:')) {
        name = line.split('"')[1] || name;
      } else if (line.includes('target_field:')) {
        target = line.split('"')[1] || target;
      } else if (line.includes('operator:')) {
        operator = line.split('"')[1] || operator;
      } else if (line.includes('value:')) {
        threshold = line.split(':')[1]?.trim() || threshold;
      } else if (line.includes('type:')) {
        action = line.split('"')[1] || action;
      }
    });

    const updatedRule = { ...activeRule, name, target, operator, threshold, action };
    setRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    setActiveRule(updatedRule);
    setFeedback({ type: 'success', message: 'Sovereign policy compiled and pushed to active runtimes.' });
  };

  const toggleRuleEnabled = (id) => {
    setRules(prev => prev.map(r => {
      if (r.id === id) {
        const nextVal = !r.enabled;
        if (activeRule.id === id) {
          setActiveRule({ ...activeRule, enabled: nextVal });
        }
        return { ...r, enabled: nextVal };
      }
      return r;
    }));
  };

  const handleAddRule = () => {
    const id = `rule_mr_${Date.now().toString().slice(-4)}`;
    const newRule = {
      id,
      name: 'New Custom Guardrail',
      target: 'custom_parameter',
      operator: '>',
      threshold: '500',
      action: 'WARN',
      description: 'Newly defined programmatic rule intercepting the execution stream.',
      enabled: true,
    };
    setRules(prev => [...prev, newRule]);
    setActiveRule(newRule);
    setYamlContent(generateYAML(newRule));
    setFeedback(null);
  };

  return (
    <div style={{ padding: 28, color: V.primary, display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
      
      {/* Header */}
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 6 }}>Sovereign Constitution Editor</div>
        <div style={{ fontSize: 13, color: V.secondary }}>
          Author and deploy lightweight interception guardrails across active SDK/Spoke nodes.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24, alignItems: 'stretch' }}>
        
        {/* Rules Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, padding: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', color: V.secondary }}>GUARDRAILS</span>
              <button
                onClick={handleAddRule}
                style={{
                  background: 'rgba(6,182,212,0.1)',
                  color: V.cyan,
                  border: `1px solid rgba(6,182,212,0.2)`,
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Add Rule
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rules.map((rule) => {
                const isActive = activeRule.id === rule.id;
                const badgeColor = rule.action === 'BLOCK' ? V.red : rule.action === 'WARN' ? V.amber : V.cyan;
                return (
                  <div
                    key={rule.id}
                    onClick={() => handleSelectRule(rule)}
                    style={{
                      background: isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                      border: `1px solid ${isActive ? V.borderLit : V.border}`,
                      borderRadius: 8,
                      padding: 12,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: rule.enabled ? V.primary : V.muted }}>
                        {rule.name}
                      </span>
                      <span
                        style={{
                          fontSize: 9,
                          fontWeight: 700,
                          color: badgeColor,
                          border: `1px solid ${badgeColor}33`,
                          background: `${badgeColor}11`,
                          padding: '1px 6px',
                          borderRadius: 10,
                        }}
                      >
                        {rule.action}
                      </span>
                    </div>

                    <div style={{ fontSize: 11, color: V.secondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rule.description}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10, borderTop: `1px solid ${V.border}66`, paddingTop: 8 }}>
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', color: V.dim }}>{rule.id}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ color: rule.enabled ? V.green : V.muted }}>
                          {rule.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleRuleEnabled(rule.id);
                          }}
                          style={{
                            width: 24,
                            height: 14,
                            background: rule.enabled ? V.green : '#334155',
                            borderRadius: 7,
                            position: 'relative',
                            cursor: 'pointer',
                          }}
                        >
                          <div style={{
                            width: 10,
                            height: 10,
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: 2,
                            left: rule.enabled ? 12 : 2,
                            transition: 'left 0.2s',
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual YAML Editor */}
        <div style={{ background: V.card, border: `1px solid ${V.border}`, borderRadius: 12, display: 'flex', flexDirection: 'column' }}>
          <div style={{ borderBottom: `1px solid ${V.border}`, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: V.primary }}>PROFILER COMPILATION GATE</span>
              <div style={{ fontSize: 11, color: V.secondary, marginTop: 2 }}>Edit YAML declaration syntax below.</div>
            </div>
            <span style={{ fontSize: 11, color: V.dim, fontFamily: 'JetBrains Mono, monospace' }}>ANCHOR v5.0 ENGINE</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16, padding: 20 }}>
            {feedback && (
              <div style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: `1px solid ${V.green}33`,
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: 12,
                color: V.green,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <svg viewBox="0 0 20 20" fill="currentColor" style={{ width: 16, height: 16 }}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                {feedback.message}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, flex: 1 }}>
              
              {/* YAML text area */}
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
                <textarea
                  value={yamlContent}
                  onChange={(e) => setYamlContent(e.target.value)}
                  style={{
                    flex: 1,
                    background: '#07080A',
                    border: `1px solid ${V.border}`,
                    borderRadius: 8,
                    padding: 16,
                    color: V.cyan,
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 13,
                    lineHeight: '1.6',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Visual preview/drift simulation */}
              <div style={{ background: V.void, border: `1px solid ${V.border}`, borderRadius: 8, padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: V.secondary }}>DECISION ENGINE SIMULATION</div>
                
                <div style={{ border: `1px solid ${V.border}`, borderRadius: 6, padding: 12, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 10, color: V.muted, textTransform: 'uppercase' }}>Rule Target Pattern</div>
                  <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: V.primary }}>
                    {activeRule.target} {activeRule.operator} {activeRule.threshold}
                  </div>
                </div>

                <div style={{ border: `1px solid ${V.border}`, borderRadius: 6, padding: 12, background: 'rgba(255,255,255,0.02)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 10, color: V.muted, textTransform: 'uppercase' }}>Action Override</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: activeRule.action === 'BLOCK' ? V.red : activeRule.action === 'WARN' ? V.amber : V.cyan }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: V.primary }}>{activeRule.action}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', borderTop: `1px solid ${V.border}`, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={handleSave}
                    style={{
                      background: V.accent,
                      color: 'white',
                      border: 'none',
                      padding: '10px',
                      borderRadius: 6,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      textAlign: 'center',
                    }}
                  >
                    Compile & Publish
                  </button>
                  <button
                    onClick={() => setYamlContent(generateYAML(activeRule))}
                    style={{
                      background: 'transparent',
                      color: V.secondary,
                      border: `1px solid ${V.border}`,
                      padding: '8px',
                      borderRadius: 6,
                      cursor: 'pointer',
                      fontSize: 12,
                    }}
                  >
                    Reset to Default
                  </button>
                </div>

              </div>

            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
