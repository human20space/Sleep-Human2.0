import React, { useState, useEffect } from 'react';
import {
  Save,
  RotateCcw,
  CheckCircle2,
  Code,
  FileText,
  Home,
  Zap,
  Bot,
  CreditCard,
  Moon,
  AlertCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import {
  sleepContentService,
  DEFAULT_SETTINGS,
} from '../../services/sleepContentService';
import { Toast, type ToastMessage } from './Toast';

export type ScreenTab =
  | 'home'
  | 'reset'
  | 'ebb'
  | 'paywall'
  | 'timer'
  | 'legal';

interface AppScreensViewProps {
  initialTab?: ScreenTab;
}

export const AppScreensView: React.FC<AppScreensViewProps> = ({
  initialTab = 'home',
}) => {
  const [activeTab, setActiveTab] = useState<ScreenTab>(initialTab);
  const [isRawJsonMode, setIsRawJsonMode] = useState(false);
  const [rawJsonText, setRawJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Settings states
  const [homeCopy, setHomeCopy] = useState<any>(DEFAULT_SETTINGS.home_copy);
  const [resetSos, setResetSos] = useState<any>(DEFAULT_SETTINGS.reset_sos);
  const [ebbSettings, setEbbSettings] = useState<any>(DEFAULT_SETTINGS.ebb_ai_settings);
  const [paywallCopy, setPaywallCopy] = useState<any>(DEFAULT_SETTINGS.paywall_copy);
  const [timerPresets, setTimerPresets] = useState<any>(DEFAULT_SETTINGS.timer_presets);
  const [legalPages, setLegalPages] = useState<any>(DEFAULT_SETTINGS.legal_pages);

  // Load from service on mount
  useEffect(() => {
    async function loadAllSettings() {
      const [h, r, e, p, t, l] = await Promise.all([
        sleepContentService.getSetting('home_copy', DEFAULT_SETTINGS.home_copy),
        sleepContentService.getSetting('reset_sos', DEFAULT_SETTINGS.reset_sos),
        sleepContentService.getSetting('ebb_ai_settings', DEFAULT_SETTINGS.ebb_ai_settings),
        sleepContentService.getSetting('paywall_copy', DEFAULT_SETTINGS.paywall_copy),
        sleepContentService.getSetting('timer_presets', DEFAULT_SETTINGS.timer_presets),
        sleepContentService.getSetting('legal_pages', DEFAULT_SETTINGS.legal_pages),
      ]);

      setHomeCopy(h);
      setResetSos(r);
      setEbbSettings(e);
      setPaywallCopy(p);
      setTimerPresets(t);
      setLegalPages(l);
    }

    loadAllSettings();
  }, []);

  const getCurrentSettingKey = (): string => {
    switch (activeTab) {
      case 'home':
        return 'home_copy';
      case 'reset':
        return 'reset_sos';
      case 'ebb':
        return 'ebb_ai_settings';
      case 'paywall':
        return 'paywall_copy';
      case 'timer':
        return 'timer_presets';
      case 'legal':
        return 'legal_pages';
    }
  };

  const getCurrentSettingValue = (): any => {
    switch (activeTab) {
      case 'home':
        return homeCopy;
      case 'reset':
        return resetSos;
      case 'ebb':
        return ebbSettings;
      case 'paywall':
        return paywallCopy;
      case 'timer':
        return timerPresets;
      case 'legal':
        return legalPages;
    }
  };

  const updateCurrentSettingValue = (val: any) => {
    switch (activeTab) {
      case 'home':
        setHomeCopy(val);
        break;
      case 'reset':
        setResetSos(val);
        break;
      case 'ebb':
        setEbbSettings(val);
        break;
      case 'paywall':
        setPaywallCopy(val);
        break;
      case 'timer':
        setTimerPresets(val);
        break;
      case 'legal':
        setLegalPages(val);
        break;
    }
  };

  const handleSelectTab = (tab: ScreenTab) => {
    setActiveTab(tab);
    setIsRawJsonMode(false);
  };

  const handleToggleRawJson = () => {
    if (!isRawJsonMode) {
      setRawJsonText(JSON.stringify(getCurrentSettingValue(), null, 2));
      setJsonError(null);
    }
    setIsRawJsonMode(!isRawJsonMode);
  };

  const handleRawJsonChange = (text: string) => {
    setRawJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      updateCurrentSettingValue(parsed);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleSave = async () => {
    if (isRawJsonMode && jsonError) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: 'Please fix JSON syntax errors before saving.',
      });
      return;
    }

    setIsSaving(true);
    const key = getCurrentSettingKey();
    const value = getCurrentSettingValue();

    try {
      await sleepContentService.saveSetting(key, value);
      setToast({
        id: Date.now().toString(),
        type: 'success',
        text: `Settings for "${key}" saved and synced successfully.`,
      });
    } catch {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        text: `Failed to save ${key}.`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const key = getCurrentSettingKey();
    const defaultVal = DEFAULT_SETTINGS[key];
    if (!defaultVal) return;

    if (window.confirm(`Reset "${key}" back to system defaults?`)) {
      updateCurrentSettingValue(defaultVal);
      await sleepContentService.saveSetting(key, defaultVal);
      setToast({
        id: Date.now().toString(),
        type: 'info',
        text: `Reset "${key}" to system defaults.`,
      });
    }
  };

  // Tab definitions
  const tabs: Array<{ id: ScreenTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'home', label: 'Sleep Home', icon: Home },
    { id: 'reset', label: 'Reset (SOS)', icon: Zap },
    { id: 'ebb', label: 'Ebb AI', icon: Bot },
    { id: 'paywall', label: 'Paywall', icon: CreditCard },
    { id: 'timer', label: 'Sleep Timer', icon: Moon },
    { id: 'legal', label: 'Legal Pages', icon: FileText },
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <Toast toast={toast} onDismiss={() => setToast(null)} />

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-2 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1F5F78] text-white shadow-2xs'
                    : 'text-[#5A6663] hover:text-[#1F2A28] hover:bg-[#F7F3EC]'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5 px-1">
          <button
            type="button"
            onClick={handleToggleRawJson}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer border ${
              isRawJsonMode
                ? 'bg-[#DCE9F0] text-[#1F5F78] border-[#1F5F78]/40 font-bold'
                : 'border-[#E6DCCB] text-[#5A6663] hover:bg-[#F7F3EC]'
            }`}
            title="Toggle Raw JSON validation mode"
          >
            <Code size={13} />
            <span>{isRawJsonMode ? 'Form View' : 'Raw JSON'}</span>
          </button>
        </div>
      </div>

      {/* Main Editor Card */}
      <div className="bg-white border border-[#E6DCCB] rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between border-b border-[#E6DCCB]/60 pb-4">
          <div>
            <h3 className="font-serif-title font-bold text-base text-[#1F2A28]">
              {tabs.find((t) => t.id === activeTab)?.label} Configuration
            </h3>
            <p className="text-xs text-[#5A6663] mt-0.5">
              Synced with Supabase <code className="font-mono bg-[#EFE9DF] px-1 py-0.2 rounded text-[11px]">sleep_settings</code> ({getCurrentSettingKey()}).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded-xl border border-[#E6DCCB] hover:bg-[#EFE9DF] text-[#5A6663] hover:text-[#1F2A28] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset to default</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (isRawJsonMode && Boolean(jsonError))}
              className="px-4 py-2 rounded-xl bg-[#1F5F78] hover:bg-[#184c60] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Save size={13} />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </div>

        {/* Editor Body: Either Raw JSON or Interactive Structured Form */}
        {isRawJsonMode ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#5A6663]">JSON Schema Validation</span>
              {jsonError ? (
                <span className="text-red-500 flex items-center gap-1 text-[11px]">
                  <AlertCircle size={12} />
                  <span>{jsonError}</span>
                </span>
              ) : (
                <span className="text-[#3C7858] flex items-center gap-1 text-[11px]">
                  <CheckCircle2 size={12} />
                  <span>Valid JSON</span>
                </span>
              )}
            </div>
            <textarea
              rows={16}
              value={rawJsonText}
              onChange={(e) => handleRawJsonChange(e.target.value)}
              className={`w-full p-4 rounded-xl border font-mono text-xs leading-relaxed focus:outline-none focus:ring-2 ${
                jsonError
                  ? 'border-red-500 focus:ring-red-200 bg-red-50/20'
                  : 'border-[#E6DCCB] focus:ring-[#1F5F78]/20 bg-[#F7F3EC]/40'
              }`}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* 1. HOME TAB */}
            {activeTab === 'home' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Header Greeting
                    </label>
                    <input
                      type="text"
                      value={homeCopy.greeting || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, greeting: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Hero Badge Text
                    </label>
                    <input
                      type="text"
                      value={homeCopy.hero_badge || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, hero_badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Hero CTA Button Label
                    </label>
                    <input
                      type="text"
                      value={homeCopy.hero_cta || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, hero_cta: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Sleep Timer Header
                    </label>
                    <input
                      type="text"
                      value={homeCopy.timer_heading || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, timer_heading: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Free Shelf Header
                    </label>
                    <input
                      type="text"
                      value={homeCopy.shelf_free || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, shelf_free: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Soundscapes Shelf Header
                    </label>
                    <input
                      type="text"
                      value={homeCopy.shelf_soundscapes || ''}
                      onChange={(e) => setHomeCopy({ ...homeCopy, shelf_soundscapes: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 2. RESET (SOS) TAB */}
            {activeTab === 'reset' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Acute Reset Title
                    </label>
                    <input
                      type="text"
                      value={resetSos.title || ''}
                      onChange={(e) => setResetSos({ ...resetSos, title: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      value={resetSos.duration_seconds || 90}
                      onChange={(e) =>
                        setResetSos({
                          ...resetSos,
                          duration_seconds: parseInt(e.target.value, 10) || 90,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Subtitle / Clinical Framing
                  </label>
                  <input
                    type="text"
                    value={resetSos.subtitle || ''}
                    onChange={(e) => setResetSos({ ...resetSos, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#1F2A28]">
                      Pacing Prompts (Breath / Somatic Guidance)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setResetSos({
                          ...resetSos,
                          pacing_prompts: [...(resetSos.pacing_prompts || []), 'New somatic prompt'],
                        })
                      }
                      className="text-xs text-[#1F5F78] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add prompt</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(resetSos.pacing_prompts || []).map((prompt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#5A6663] w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => {
                            const copy = [...resetSos.pacing_prompts];
                            copy[idx] = e.target.value;
                            setResetSos({ ...resetSos, pacing_prompts: copy });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = resetSos.pacing_prompts.filter((_: any, i: number) => i !== idx);
                            setResetSos({ ...resetSos, pacing_prompts: copy });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. EBB AI TAB */}
            {activeTab === 'ebb' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Guide Persona / Character Title
                  </label>
                  <input
                    type="text"
                    value={ebbSettings.persona || ''}
                    onChange={(e) => setEbbSettings({ ...ebbSettings, persona: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    System Prompt Persona & Philosophy
                  </label>
                  <textarea
                    rows={8}
                    value={ebbSettings.systemPrompt || ''}
                    onChange={(e) => setEbbSettings({ ...ebbSettings, systemPrompt: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E6DCCB] text-xs font-mono leading-relaxed bg-[#F7F3EC]/30"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#1F2A28]">
                      Starter Prompts (Night Seeker Pills)
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setEbbSettings({
                          ...ebbSettings,
                          starter_prompts: [...(ebbSettings.starter_prompts || []), 'Help me quiet racing thoughts.'],
                        })
                      }
                      className="text-xs text-[#1F5F78] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add starter prompt</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(ebbSettings.starter_prompts || []).map((prompt: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#5A6663] w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={prompt}
                          onChange={(e) => {
                            const copy = [...ebbSettings.starter_prompts];
                            copy[idx] = e.target.value;
                            setEbbSettings({ ...ebbSettings, starter_prompts: copy });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = ebbSettings.starter_prompts.filter((_: any, i: number) => i !== idx);
                            setEbbSettings({ ...ebbSettings, starter_prompts: copy });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 4. PAYWALL TAB */}
            {activeTab === 'paywall' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Paywall Headline
                    </label>
                    <input
                      type="text"
                      value={paywallCopy.headline || ''}
                      onChange={(e) => setPaywallCopy({ ...paywallCopy, headline: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                      Annual Discount Badge
                    </label>
                    <input
                      type="text"
                      value={paywallCopy.annual_save_badge || ''}
                      onChange={(e) => setPaywallCopy({ ...paywallCopy, annual_save_badge: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Paywall Subtitle
                  </label>
                  <input
                    type="text"
                    value={paywallCopy.subtitle || ''}
                    onChange={(e) => setPaywallCopy({ ...paywallCopy, subtitle: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-[#1F2A28]">
                      Benefits Bullets
                    </label>
                    <button
                      type="button"
                      onClick={() =>
                        setPaywallCopy({
                          ...paywallCopy,
                          benefits: [...(paywallCopy.benefits || []), 'Unlimited access to sovereign features'],
                        })
                      }
                      className="text-xs text-[#1F5F78] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} />
                      <span>Add bullet</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {(paywallCopy.benefits || []).map((b: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="text-xs font-mono text-[#5A6663] w-6">{idx + 1}.</span>
                        <input
                          type="text"
                          value={b}
                          onChange={(e) => {
                            const copy = [...paywallCopy.benefits];
                            copy[idx] = e.target.value;
                            setPaywallCopy({ ...paywallCopy, benefits: copy });
                          }}
                          className="flex-1 px-3 py-2 rounded-xl border border-[#E6DCCB] text-xs bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const copy = paywallCopy.benefits.filter((_: any, i: number) => i !== idx);
                            setPaywallCopy({ ...paywallCopy, benefits: copy });
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 5. SLEEP TIMER TAB */}
            {activeTab === 'timer' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Preset Durations in Minutes (comma-separated, e.g. 15, 30, 45, 60)
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(timerPresets.presets)
                        ? timerPresets.presets.join(', ')
                        : '15, 30, 45, 60'
                    }
                    onChange={(e) => {
                      const nums = e.target.value
                        .split(',')
                        .map((n) => parseInt(n.trim(), 10))
                        .filter((n) => !isNaN(n));
                      setTimerPresets({ ...timerPresets, presets: nums });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Bell Tones Options (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={
                      Array.isArray(timerPresets.bell_tones)
                        ? timerPresets.bell_tones.join(', ')
                        : 'tibetan, temple, tingsha'
                    }
                    onChange={(e) => {
                      const tones = e.target.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean);
                      setTimerPresets({ ...timerPresets, bell_tones: tones });
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#E6DCCB] text-xs font-mono bg-white"
                  />
                </div>
              </div>
            )}

            {/* 6. LEGAL PAGES TAB */}
            {activeTab === 'legal' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Terms of Service (Markdown)
                  </label>
                  <textarea
                    rows={6}
                    value={legalPages.terms || ''}
                    onChange={(e) => setLegalPages({ ...legalPages, terms: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E6DCCB] text-xs font-mono leading-relaxed bg-[#F7F3EC]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Privacy Policy (Markdown)
                  </label>
                  <textarea
                    rows={6}
                    value={legalPages.privacy || ''}
                    onChange={(e) => setLegalPages({ ...legalPages, privacy: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E6DCCB] text-xs font-mono leading-relaxed bg-[#F7F3EC]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1F2A28] mb-1">
                    Clinical Advisory Notice (Markdown)
                  </label>
                  <textarea
                    rows={4}
                    value={legalPages.advisory || ''}
                    onChange={(e) => setLegalPages({ ...legalPages, advisory: e.target.value })}
                    className="w-full p-3.5 rounded-xl border border-[#E6DCCB] text-xs font-mono leading-relaxed bg-[#F7F3EC]/30"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
