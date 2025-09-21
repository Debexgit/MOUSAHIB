export type Tool = {
  id: string;
  icon: string;
  name: string;
  desc: string;
  placeholder: string;
};

export type ToolGroup = {
  name: string;
  color: 'blue' | 'green' | 'yellow' | 'purple';
  tools: Tool[];
};

export const toolsData: ToolGroup[] = [
  {
    name: '🗓️ التخطيط',
    color: 'blue',
    tools: [
      { id: 'lesson', icon: '📝', name: 'التخطيط', desc: 'خطط للدروس، الوحدات، والأهداف.', placeholder: 'مثال: وحدة دراسية عن الفضاء والكواكب' },
    ],
  },
  {
    name: '🎭 أنشطة الفصل',
    color: 'green',
    tools: [
      { id: 'activity', icon: '🤸', name: 'أنشطة الفصل', desc: 'أنشطة، لعب أدوار، وأسئلة.', placeholder: 'مثال: أنشطة فنية عن فصل الخريف' },
    ],
  },
    {
    name: '📝 بطاقات تعليمية',
    color: 'yellow',
    tools: [
       { id: 'flashcard', icon: '🗂️', name: 'بطاقات تعليمية', desc: 'أنشئ بطاقات لكلمات ومفاهيم.', placeholder: 'مثال: بطاقات عن حيوانات المزرعة' },
    ],
  },
    {
    name: '📖 موارد تعليمية',
    color: 'purple',
    tools: [
      { id: 'story', icon: '📚', name: 'قصة', desc: 'مواد قصص.', placeholder: 'مثال: قصة عن صداقة بين قطة وفأر' },
      { id: 'song', icon: '🎵', name: 'أنشودة', desc: 'مواد أناشيد.', placeholder: 'مثال: أنشودة عن الألوان' },
    ],
  },
    {
    name: '📋 ملخص اليوم والملاحظات',
    color: 'blue',
    tools: [
       { id: 'summary', icon: '📑', name: 'ملخص اليوم والملاحظات', desc: 'لخص اليوم ودون الملاحظات.', placeholder: 'مثال: "اليوم تعلمنا عن حرف الباء، ولعبنا في الخارج..."' },
    ],
  },
    {
    name: '📩 رسائل للأهل',
    color: 'green',
    tools: [
      { id: 'communication', icon: '📧', name: 'رسائل للأهل', desc: 'تواصل بفعالية مع أولياء الأمور.', placeholder: 'مثال: إبلاغ الأهل بالرحلة القادمة إلى الحديقة' },
    ],
  },
      {
    name: '🏡 أنشطة منزلية',
    color: 'yellow',
    tools: [
      { id: 'parent', icon: '🏠', name: 'أنشطة منزلية', desc: 'عزز التعلم في المنزل.', placeholder: 'مثال: أنشطة منزلية لتعزيز مفهوم الألوان' },
    ],
  },
    {
    name: '🆘 خطة دعم',
    color: 'purple',
    tools: [
        { id: 'support', icon: '❤️', name: 'خطة دعم', desc: 'ضع خطة دعم فردية.', placeholder: 'مثال: طالب يواجه صعوبة في التعرف على الحروف' },
    ],
  },
];
