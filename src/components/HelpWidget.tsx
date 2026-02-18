import { useState, useRef, useCallback } from 'react';
import { MessageCircleQuestion, X, Camera, Send, Loader2 } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';

export function HelpWidget() {
  const { config } = useTenant();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleScreenshot = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Screenshot must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setScreenshot(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    try {
      // TODO: POST to /support/request backend endpoint
      await fetch(`${config.apiBaseUrl}/support/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: message.trim(),
          screenshotBase64: screenshot || undefined,
          page: window.location.pathname,
          tenant: config.tenantId,
        }),
      });
      setSubmitted(true);
      setMessage('');
      setScreenshot(null);
      setTimeout(() => { setSubmitted(false); setIsOpen(false); }, 2000);
    } catch {
      alert('Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [message, screenshot, config]);

  if (!config.features.helpWidget) return null;

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-10 h-10 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:opacity-90 transition-opacity"
        title="Help"
      >
        {isOpen ? <X className="w-4 h-4" /> : <MessageCircleQuestion className="w-4 h-4" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-16 right-4 z-50 w-80 bg-card border border-border rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-border bg-secondary/30">
            <h3 className="text-xs font-semibold text-foreground">Need help?</h3>
            <p className="text-[10px] text-muted-foreground">Describe your issue and we'll get back to you.</p>
          </div>

          {submitted ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              ✅ Submitted! We'll get back to you soon.
            </div>
          ) : (
            <div className="p-3 space-y-2">
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="What do you need help with?"
                className="w-full h-24 px-2 py-1.5 text-xs bg-secondary border border-border rounded-md text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              />

              {screenshot && (
                <div className="relative">
                  <img src={screenshot} alt="Screenshot" className="h-16 rounded border border-border" />
                  <button
                    onClick={() => setScreenshot(null)}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[8px]"
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  onClick={handleScreenshot}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Camera className="w-3 h-3" />
                  {screenshot ? 'Replace screenshot' : 'Attach screenshot'}
                </button>

                <button
                  onClick={handleSubmit}
                  disabled={!message.trim() || isSubmitting}
                  className="flex items-center gap-1 px-3 py-1 text-[10px] font-semibold bg-primary text-primary-foreground rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                  Send
                </button>
              </div>

              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
          )}
        </div>
      )}
    </>
  );
}
