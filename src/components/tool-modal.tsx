'use client';

// استيراد المكتبات والمكونات اللازمة
import * as allActions from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Tool } from '@/lib/tools';
import { Copy, Sparkles } from 'lucide-react';
import { useState, useTransition, useEffect, useRef } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

// هذا الكائن يربط كل معرف أداة بالدالة المناسبة لها في الخادم
const toolActions: Record<string, (userInput: string, age: string) => Promise<any>> = {
  lesson: allActions.handleLesson,
  activity: allActions.handleActivity,
  flashcard: allActions.handleFlashcard,
  story: allActions.handleStory,
  song: allActions.handleSong,
  summary: allActions.handleSummary,
  communication: allActions.handleCommunication,
  parent: allActions.handleParent,
  support: allActions.handleSupport,
};

// تعريف أنواع البيانات للنتائج
type BilingualResult = {
  arabic: string | null;
  french: string | null;
  arabicAudio?: string | null;
  frenchAudio?: string | null;
};

// تعريف خصائص المكون
type ToolModalProps = {
  tool: Tool | null;
  isOpen: boolean;
  onClose: () => void;
};

// المكون الرئيسي للنافذة المنبثقة
export default function ToolModal({ tool, isOpen, onClose }: ToolModalProps) {
  // حالة لحفظ نص الإدخال من المستخدم
  const [input, setInput] = useState('');
  // حالة لحفظ النتيجة العائدة من الخادم
  const [result, setResult] = useState<BilingualResult | null>(null);
  // حالة لتحديد اللغة المعروضة حالياً (عربي أو فرنسي)
  const [currentLang, setCurrentLang] = useState<'arabic' | 'french'>('arabic');
  // حالة التحميل لإظهار مؤشر بصري وتعطيل الأزرار
  const [isPending, startTransition] = useTransition();
  // حالة لنص زر النسخ (نسخ النص / تم النسخ)
  const [copyButtonText, setCopyButtonText] = useState('نسخ النص');
  // हुक لإظهار رسائل التنبيه
  const { toast } = useToast();
  // حالة لحفظ المستوى العمري المحدد
  const [ageLevel, setAgeLevel] = useState('4 years');
  // مرجع لعنصر الصوت لتشغيل الأناشيد
  const audioRef = useRef<HTMLAudioElement>(null);

  // دالة معالجة إرسال النموذج
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!tool || !input.trim()) {
      toast({
        title: 'خطأ',
        description: 'الرجاء إدخال طلبك.',
        variant: 'destructive',
      });
      return;
    }
    
    // تحديد الدالة الصحيحة للاستدعاء بناءً على معرف الأداة
    let action;
    // دمج الأدوات المتشابهة في الأداة الرئيسية
    if (['lesson', 'objectives', 'unit'].includes(tool.id)) {
        action = toolActions['lesson'];
    } else if (['activity', 'roleplay', 'questions'].includes(tool.id)) {
        action = toolActions['activity'];
    } else if (['story', 'song'].includes(tool.id)) {
        action = toolActions[tool.id];
    } else if (['summary', 'observation'].includes(tool.id)) {
        action = toolActions['summary'];
    }
    else {
        action = toolActions[tool.id];
    }
    
    if (!action) {
      toast({
        title: 'خطأ',
        description: 'الأداة المحددة غير صالحة.',
        variant: 'destructive',
      });
      return;
    }

    // إعادة تعيين الحالات قبل البدء
    setResult(null);
    setCopyButtonText('نسخ النص');
    setCurrentLang('arabic');

    // بدء عملية التحميل (isPending = true)
    startTransition(async () => {
      // استدعاء دالة الخادم المناسبة مع تمرير المدخلات والمستوى العمري
      const response = await action(input, ageLevel); 
      if (response.error) {
        toast({
          title: 'حدث خطأ',
          description: response.error,
          variant: 'destructive',
        });
        // حتى في حالة حدوث خطأ (مثل فشل الصوت)، قد تكون هناك بيانات نصية لعرضها
        if (response.arabic || response.french) {
           setResult({ arabic: response.arabic, french: response.french });
        } else {
           setResult(null);
        }
      } else {
        // في حالة النجاح، قم بتحديث حالة النتيجة
        setResult(response);
      }
    });
  };
  
  // دالة لنسخ النص المعروض حاليًا إلى الحافظة
  const handleCopy = () => {
    const textToCopy = result?.[currentLang] ?? '';
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(
      () => {
        setCopyButtonText('تم النسخ!');
        setTimeout(() => setCopyButtonText('نسخ النص'), 2000); // إعادة تعيين النص بعد ثانيتين
      },
      (err) => {
        console.error('Could not copy text: ', err);
        toast({
          title: 'خطأ',
          description: 'لم نتمكن من نسخ النص.',
          variant: 'destructive',
        });
      }
    );
  };
  
  // دالة لإغلاق النافذة المنبثقة وإعادة تعيين الحالات
  const handleClose = () => {
    if (isPending) return; // منع الإغلاق أثناء التحميل
    onClose();
    // تأخير إعادة التعيين لإعطاء تأثير إغلاق سلس
    setTimeout(() => {
        setInput('');
        setResult(null);
    }, 300);
  }
  
  // تحديث مصدر الصوت عند تغير اللغة أو النتيجة
  useEffect(() => {
    if (audioRef.current && result) {
      const audioUrl = currentLang === 'arabic' ? result.arabicAudio : result.frenchAudio;
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load(); // إعادة تحميل مصدر الصوت
      }
    }
  }, [result, currentLang]);

  // لا تعرض شيئًا إذا لم يتم تحديد أداة
  if (!tool) {
    return null;
  }

  const displayedResult = result?.[currentLang] ?? '';
  const audioSource = currentLang === 'arabic' ? result?.arabicAudio : result?.frenchAudio;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-6">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-primary font-headline">
            <span className="text-3xl">{tool.icon}</span>
            {tool.name}
          </DialogTitle>
        </DialogHeader>

        {/* نموذج الإدخال */}
        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor={`${tool.id}-level`}
              className="block text-right text-sm font-bold"
            >
              اختر المستوى:
            </Label>
            <Select value={ageLevel} onValueChange={setAgeLevel} dir='rtl'>
                <SelectTrigger id={`${tool.id}-level`} className="w-full">
                    <SelectValue placeholder="اختر المستوى" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="4 years">التمهيدي الأول</SelectItem>
                    <SelectItem value="5 years">التمهيدي الثاني</SelectItem>
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor={`${tool.id}-input`}
              className="block text-right text-sm font-bold"
            >
              أدخل طلبك هنا:
            </Label>
            <Textarea
              id={`${tool.id}-input`}
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="shadow-sm focus:ring-2 focus:ring-primary"
              placeholder={tool.placeholder}
              disabled={isPending} // تعطيل حقل الإدخال أثناء التحميل
            />
          </div>
          <div className="text-center">
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                'جاري التوليد...'
              ) : (
                <>
                  <Sparkles className="ml-2 h-4 w-4" /> توليد
                </>
              )}
            </Button>
          </div>
        </form>

        {/* قسم عرض النتائج */}
        {(isPending || result) && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xl font-bold font-headline">النتيجة:</h4>
                {/* أزرار التحكم في اللغة والنسخ */}
                <div className="flex items-center gap-2">
                  {result && !isPending && (result.arabic || result.french) && (
                    <>
                      <div className="flex rounded-md bg-muted p-1">
                        <Button
                          size="sm"
                          variant={currentLang === 'arabic' ? 'secondary' : 'ghost'}
                          onClick={() => setCurrentLang('arabic')}
                          className="h-7"
                          disabled={!result.arabic}
                        >
                          AR
                        </Button>
                        <Button
                          size="sm"
                           variant={currentLang === 'french' ? 'secondary' : 'ghost'}
                          onClick={() => setCurrentLang('french')}
                          className="h-7"
                          disabled={!result.french}
                        >
                          FR
                        </Button>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleCopy}>
                        <Copy className="ml-2 h-4 w-4" />
                        {copyButtonText}
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              {/* مشغل الصوت */}
              {audioSource && !isPending && (
                <div className="my-4">
                  <audio ref={audioRef} controls className="w-full">
                    <source src={audioSource} type="audio/wav" />
                    متصفحك لا يدعم عنصر الصوت.
                  </audio>
                </div>
              )}
              
              {/* حاوية النتيجة مع شريط تمرير */}
              <div className="bg-muted p-4 rounded-lg min-h-[12rem] max-h-96 overflow-y-auto">
                {isPending ? (
                  // حالة التحميل
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="loader"></div>
                    <p className="mt-4 text-muted-foreground">جاري إنشاء المحتوى، يرجى الانتظار...</p>
                  </div>
                ) : (
                  // عرض النتيجة
                  <pre
                    className="whitespace-pre-wrap font-body text-sm text-foreground"
                    dir={currentLang === 'arabic' ? 'rtl' : 'ltr'}
                  >
                    {displayedResult || "لم يتم إنشاء محتوى. حاول مرة أخرى."}
                  </pre>
                )}
              </div>
            </div>
          )}
      </DialogContent>
    </Dialog>
  );
}
