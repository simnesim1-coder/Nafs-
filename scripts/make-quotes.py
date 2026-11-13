"""Curated NAFS messages: 400 direct prompts and 400 Islamic reminders in four languages.
No verse/hadith attribution. Run: python3 scripts/make-quotes.py
"""
import json, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
def line(s):
 a=[x.strip() for x in s.split('|')];assert len(a)==4,(s,a);return dict(zip(('ru','en','tr','ar'),a))
def theme(category,hooks,actions,faith=False):
 assert len(hooks)==5,(category,len(hooks));assert len(actions)==8,(category,len(actions))
 return category,[line(x) for x in hooks],[line(x) for x in actions],faith

regular=[
theme('discipline',[
'Ты снова ждёшь подходящего настроения.|You are waiting for the perfect mood again.|Yine doğru ruh hâlini bekliyorsun.|أنت تنتظر المزاج المثالي من جديد.',
'Обещания себе ничего не стоят без действий.|Promises to yourself mean nothing without action.|Kendine verdiğin sözler eylemsiz bir işe yaramaz.|وعودك لنفسك لا قيمة لها دون عمل.',
'Дисциплина начинается там, где кончаются оправдания.|Discipline begins where excuses end.|Disiplin, bahanelerin bittiği yerde başlar.|يبدأ الانضباط عندما تنتهي الأعذار.',
'Твоё расписание показывает твои настоящие приоритеты.|Your schedule reveals your real priorities.|Programın gerçek önceliklerini gösterir.|جدولك يكشف أولوياتك الحقيقية.',
'Тебе не нужен новый понедельник.|You do not need another Monday.|Yeni bir pazartesiye ihtiyacın yok.|لست بحاجة إلى يوم اثنين جديد.'
],[
'Начни сейчас с пяти минут работы.|Start with five minutes of work now.|Şimdi beş dakika çalışarak başla.|ابدأ الآن بخمس دقائق من العمل.',
'Запиши одно обязательство и выполни его сегодня.|Write down one commitment and finish it today.|Bir sözünü yaz ve bugün yerine getir.|اكتب التزامًا واحدًا وأنجزه اليوم.',
'Убери телефон и сделай первый шаг.|Put your phone away and take the first step.|Telefonu kaldır ve ilk adımı at.|أبعد هاتفك واتخذ الخطوة الأولى.',
'Закрой одно дело прежде, чем открывать следующее.|Finish one task before opening another.|Yenisini açmadan önce bir işi bitir.|أنهِ مهمة قبل أن تبدأ غيرها.',
'Не обсуждай план; выполни его первую часть.|Stop discussing the plan; do its first part.|Planı konuşmayı bırak; ilk kısmını yap.|توقف عن شرح الخطة ونفذ أول جزء منها.',
'Поставь таймер на десять минут и не отвлекайся.|Set a ten-minute timer and do not drift away.|On dakikalık süre tut ve dikkatini dağıtma.|اضبط عشر دقائق ولا تشتت انتباهك.',
'Сделай неприятную, но важную задачу первой.|Do the unpleasant but important task first.|Zor ama önemli işi önce yap.|ابدأ بالمهمة الصعبة والمهمة.',
'Вечером проверь результат, а не свои намерения.|Tonight measure results, not intentions.|Akşam niyetlerini değil, sonucu kontrol et.|راجع النتيجة مساءً لا النوايا.'
]),
theme('procrastination',[
'Пока ты откладываешь, задача не исчезает.|While you delay, the task does not disappear.|Sen erteledikçe iş ortadan kaybolmaz.|المهمة لا تختفي لأنك تؤجلها.',
'Завтра не исправит сегодняшнее бездействие.|Tomorrow will not repair today’s inaction.|Yarın bugünkü hareketsizliği düzeltmez.|الغد لن يصلح تقاعسك اليوم.',
'Твоё «потом» уже забрало слишком много времени.|Your “later” has already stolen enough time.|“Sonra” sözün yeterince zamanını aldı.|لقد سرقت كلمة «لاحقًا» الكثير من وقتك.',
'Страх начать выглядит как бесконечная подготовка.|Fear of starting often looks like endless preparation.|Başlama korkusu bazen bitmeyen hazırlık gibi görünür.|قد يبدو الخوف من البدء تحضيرًا لا ينتهي.',
'Каждое отложенное дело занимает место в голове.|Every delayed task keeps taking space in your mind.|Ertelediğin her iş zihninde yer kaplar.|كل مهمة مؤجلة تشغل مساحة في ذهنك.'
],[
'Открой нужный документ прямо сейчас.|Open the needed document right now.|Gerekli dosyayı hemen aç.|افتح الملف المطلوب الآن.',
'Сделай первый черновой вариант за пятнадцать минут.|Make a rough first version in fifteen minutes.|On beş dakikada ilk taslağı hazırla.|أعد مسودة أولى خلال خمس عشرة دقيقة.',
'Назови следующий шаг одним глаголом и сделай его.|Name the next step with one verb and do it.|Sonraki adımı tek fiille tanımla ve yap.|سمّ الخطوة التالية بفعل واحد ونفذها.',
'Выключи уведомления до окончания первого этапа.|Mute notifications until the first part is done.|İlk aşama bitene dek bildirimleri kapat.|أوقف الإشعارات حتى تنهي المرحلة الأولى.',
'Раздели задачу на три коротких действия.|Break the task into three short actions.|İşi üç küçük adıma böl.|قسّم المهمة إلى ثلاث خطوات قصيرة.',
'Скажи себе время начала, а не срок очередного обещания.|Choose a start time, not another promise date.|Yeni söz vermek yerine başlama saatini belirle.|حدد وقت البدء بدل موعد لوعد جديد.',
'Закончи сегодня хотя бы один незавершённый пункт.|Finish at least one unfinished item today.|Bugün yarım kalan en az bir işi bitir.|أنهِ اليوم أمرًا واحدًا معلقًا على الأقل.',
'Начни с самой простой части и набери ход.|Start with the easiest part and build momentum.|En kolay kısımdan başla ve hız kazan.|ابدأ بالجزء الأسهل ثم واصل.'
]),
theme('responsibility',[
'Твои решения создают твою повседневность.|Your choices create your everyday life.|Günlük hayatını seçimlerin kurar.|قراراتك تصنع يومك.',
'Обстоятельства сложные, но твой шаг всё ещё твой.|Conditions are hard, but your next step is still yours.|Şartlar zor olabilir ama sıradaki adım senin.|قد تكون الظروف صعبة لكن خطوتك التالية بيدك.',
'Никто не сделает твоё главное дело за тебя.|No one can do your most important work for you.|En önemli işini kimse senin yerine yapamaz.|لن ينجز أحد أهم مهامك بدلًا منك.',
'Слова «я постараюсь» не заменяют результата.|“I will try” is not a completed result.|“Deneyeceğim” demek sonuç değildir.|قول «سأحاول» ليس إنجازًا.',
'Честность с собой начинается с простого вопроса.|Being honest with yourself starts with one question.|Kendine dürüstlük basit bir soruyla başlar.|تبدأ الصراحة مع النفس بسؤال بسيط.'
],[
'Назови дело, за которое отвечаешь лично.|Name the task you personally own.|Sorumluluğunun sende olduğu işi söyle.|سمّ العمل الذي تتحمل مسؤوليته.',
'Перестань искать виноватых и исправь один пункт.|Stop assigning blame and fix one thing.|Suçlu aramayı bırak, bir şeyi düzelt.|توقف عن لوم الآخرين وأصلح شيئًا واحدًا.',
'Запиши факты: что сделано и что осталось.|Write the facts: done and still pending.|Gerçekleri yaz: ne bitti, ne kaldı?|اكتب الحقائق: ما أُنجز وما بقي.',
'Выполни обещание, которое дал вчера.|Keep the promise you made yesterday.|Dün verdiğin sözü tut.|أوفِ بوعد قطعته بالأمس.',
'Признай ошибку без длинных объяснений.|Admit one mistake without a long speech.|Uzun açıklama yapmadan hatanı kabul et.|اعترف بخطأ دون تبريرات طويلة.',
'Выбери одну вещь, на которую реально влияешь.|Choose one thing you can actually control.|Gerçekten etkileyebildiğin bir şeyi seç.|اختر أمرًا تستطيع التأثير فيه فعلًا.',
'Проверь сроки и предупреди, если не успеваешь.|Check the deadline and speak up if you are late.|Süreyi kontrol et; yetişmiyorsan haber ver.|راجع الموعد وأبلغ إن كنت ستتأخر.',
'Сделай сегодня то, о чём давно говоришь.|Do today what you keep talking about.|Uzun zamandır konuştuğun şeyi bugün yap.|افعل اليوم ما تكثر الحديث عنه.'
]),
theme('consistency',[
'Один сильный день не заменяет месяц привычки.|One heroic day cannot replace a month of habit.|Tek bir yoğun gün, bir aylık alışkanlığın yerini tutmaz.|يوم قوي واحد لا يعوض شهرًا من الاستمرار.',
'Результат строится повторением, а не вспышкой.|Results come from repetition, not a burst.|Sonuç ani hevesle değil, tekrarla oluşur.|النتائج تأتي بالتكرار لا بالحماس العابر.',
'Долго продержится не самый громкий план.|The loudest plan is not always the one that lasts.|En gösterişli plan en uzun süren plan değildir.|الخطة الصاخبة ليست دائمًا الأكثر دوامًا.',
'Сложный день — проверка системы, а не повод уйти.|A hard day tests your system; it is not a reason to quit.|Zor gün sistemi sınar, bırakmak için bahane değildir.|اليوم الصعب يختبر نظامك ولا يبرر الانسحاب.',
'Привычка работает, когда её не хочется выполнять.|A habit matters most when you do not feel like doing it.|Alışkanlık, yapmak istemediğinde de sürdürülür.|تظهر قيمة العادة حين لا ترغب في فعلها.'
],[
'Сделай минимальную версию привычки сегодня.|Do the smallest version of your habit today.|Bugün alışkanlığının en küçük hâlini yap.|نفذ اليوم أصغر نسخة من عادتك.',
'Закрепи для неё одно постоянное время.|Give it one consistent time slot.|Ona her gün sabit bir zaman ayır.|خصص لها وقتًا ثابتًا.',
'Отметь выполнение только после настоящего действия.|Check it off only after truly doing it.|Yalnızca gerçekten yaptıktan sonra işaretle.|سجل الإنجاز بعد التنفيذ الفعلي فقط.',
'Подготовь всё необходимое на завтра заранее.|Prepare tomorrow’s essentials in advance.|Yarın gerekenleri önceden hazırla.|جهّز ما تحتاجه للغد مسبقًا.',
'Уменьши объём, но не бросай без причины.|Scale it down instead of quitting without reason.|Gerekirse azalt ama sebepsiz bırakma.|خفف المقدار بدل الانقطاع بلا سبب.',
'Повтори полезное действие второй день подряд.|Repeat one useful action for a second day.|Yararlı bir davranışı ikinci gün de tekrarla.|كرر فعلًا نافعًا لليوم الثاني.',
'Убери одну преграду перед ежедневным началом.|Remove one obstacle before the daily start.|Günlük başlangıcın önündeki engeli kaldır.|أزل عائقًا أمام البداية اليومية.',
'Оцени неделю по фактам, а не по одному настроению.|Judge the week by facts, not a single mood.|Haftayı tek bir ruh hâline göre değil, gerçeklere göre değerlendir.|قيّم أسبوعك بالوقائع لا بمزاج يوم واحد.'
]),
theme('impulses',[
'Не каждое желание заслуживает твоего согласия.|Not every urge deserves your agreement.|Her istek yerine getirilmeyi hak etmez.|ليست كل رغبة جديرة بالاستجابة.',
'Телефон не должен управлять каждым свободным моментом.|Your phone should not own every spare moment.|Telefon her boş anını yönetmemeli.|لا تجعل الهاتف يتحكم بكل لحظة فراغ.',
'Пять секунд удовольствия могут украсть час внимания.|Five seconds of pleasure can steal an hour of focus.|Beş saniyelik keyif bir saatlik dikkati çalabilir.|قد تسرق متعة خمس ثوان ساعة من التركيز.',
'Сильное желание — не приказ, который надо выполнять.|A strong urge is not an order.|Güçlü bir istek emir değildir.|الرغبة القوية ليست أمرًا يجب تنفيذه.',
'Контроль начинается до того, как ты открыл приложение.|Control starts before you open the app.|Kontrol, uygulamayı açmadan önce başlar.|يبدأ ضبط النفس قبل أن تفتح التطبيق.'
],[
'Отложи решение на десять минут и проверь себя снова.|Delay the decision ten minutes and check again.|Kararı on dakika ertele, sonra tekrar düşün.|أجّل القرار عشر دقائق ثم أعد تقييمه.',
'Убери источник отвлечения из поля зрения.|Move the distraction out of sight.|Dikkatini dağıtan şeyi gözünden uzaklaştır.|أبعد مصدر التشتيت عن نظرك.',
'Встань, выпей воды и вернись к цели.|Stand up, drink water, and return to your goal.|Ayağa kalk, su iç ve hedefine dön.|قف واشرب الماء ثم عد إلى هدفك.',
'Спроси себя, чего ты хочешь через час.|Ask what you will want an hour from now.|Bir saat sonra ne isteyeceğini kendine sor.|اسأل نفسك عما ستريده بعد ساعة.',
'Закрой ленту и открой нужную задачу.|Close the feed and open your actual task.|Akışı kapat, yapman gereken işe dön.|أغلق التصفح وافتح مهمتك الحقيقية.',
'Сделай три спокойных вдоха перед действием.|Take three calm breaths before acting.|Harekete geçmeden önce üç sakin nefes al.|خذ ثلاثة أنفاس هادئة قبل التصرف.',
'Назови желание словами, не следуя ему автоматически.|Name the urge without automatically following it.|İsteği adlandır ama otomatik olarak peşinden gitme.|سمّ الرغبة دون أن تتبعها تلقائيًا.',
'Выбери действие, о котором не пожалеешь вечером.|Choose an action you will respect tonight.|Akşam pişman olmayacağın davranışı seç.|اختر فعلًا لن تندم عليه مساءً.'
]),
theme('resilience',[
'Трудный день не отменяет твою ответственность перед собой.|A hard day does not cancel your responsibility to yourself.|Zor bir gün kendine karşı sorumluluğunu silmez.|اليوم الصعب لا يلغي مسؤوليتك تجاه نفسك.',
'Один промах — событие, а не твоя личность.|One mistake is an event, not your identity.|Tek bir hata senin kimliğin değildir.|الخطأ الواحد حدث وليس هويتك.',
'Ты не обязан побеждать весь день сразу.|You do not have to win the whole day at once.|Bütün günü tek seferde kazanmak zorunda değilsin.|لست مطالبًا بالنجاح في اليوم كله دفعة واحدة.',
'Срыв не обязан превращаться в целую неделю.|One setback need not consume your entire week.|Bir aksilik bütün haftanı mahvetmek zorunda değil.|التعثر لا يجب أن يضيع أسبوعك.',
'Сила — это вернуться к делу после ошибки.|Strength is returning to the task after a mistake.|Güç, hatadan sonra işe dönebilmektir.|القوة هي العودة للعمل بعد الخطأ.'
],[
'Выбери маленькое действие, которое можешь сделать сейчас.|Choose one small action you can do now.|Şimdi yapabileceğin küçük bir adım seç.|اختر خطوة صغيرة تستطيع تنفيذها الآن.',
'Отдели факт ошибки от осуждения себя.|Separate what happened from judging yourself.|Olan hatayı kendini yargılamaktan ayır.|افصل حقيقة الخطأ عن جلد الذات.',
'Вернись к последнему понятному пункту плана.|Return to the last clear step of the plan.|Planın son net adımına geri dön.|عد إلى آخر خطوة واضحة في خطتك.',
'Попроси о помощи, если одному не справиться.|Ask for help if doing it alone is too much.|Tek başına zorlanıyorsan destek iste.|اطلب المساعدة إن كان الحمل فوق طاقتك.',
'Возьми паузу и назначь точное время возвращения.|Take a break and set a specific return time.|Mola ver ve dönüş saatini belirle.|استرح وحدد وقتًا دقيقًا للعودة.',
'Запиши, что помешало, и измени одно условие.|Write what got in the way and change one condition.|Neyin engel olduğunu yaz ve bir koşulu değiştir.|اكتب العائق وغيّر ظرفًا واحدًا.',
'Оставь вчерашний провал во вчерашнем дне.|Leave yesterday’s failure in yesterday.|Dünkü başarısızlığı dünde bırak.|اترك إخفاق الأمس في الأمس.',
'Сегодня начни снова, без громких клятв.|Restart today without dramatic promises.|Büyük yeminler etmeden bugün yeniden başla.|ابدأ اليوم مجددًا بلا وعود ضخمة.'
]),
theme('habits',[
'Твои привычки тренируют тебя каждый день.|Your habits train you every day.|Alışkanlıkların seni her gün şekillendirir.|عاداتك تشكّلك كل يوم.',
'То, что ты повторяешь, становится легче.|What you repeat becomes easier.|Tekrarladığın şey kolaylaşır.|ما تكرره يصبح أسهل.',
'Большая цель без маленьких действий остаётся картинкой.|A big goal without small actions stays a picture.|Küçük adımlar yoksa büyük hedef sadece resimdir.|الهدف الكبير بلا خطوات صغيرة يبقى مجرد صورة.',
'Твоя среда может помогать дисциплине или мешать ей.|Your environment can support or block discipline.|Ortamın disiplinini destekler ya da engeller.|بيئتك قد تعين انضباطك أو تعيقه.',
'Новая привычка требует места в реальном дне.|A new habit needs a place in your real day.|Yeni alışkanlığın gerçek gününde bir yeri olmalı.|العادة الجديدة تحتاج مكانًا في يومك الحقيقي.'
],[
'Свяжи полезное действие с уже привычным занятием.|Attach a useful action to an existing routine.|Yararlı davranışı mevcut bir rutine bağla.|اربط فعلًا نافعًا بروتين ثابت.',
'Положи нужную вещь там, где увидишь её утром.|Put the needed item where you will see it in the morning.|Gerekli şeyi sabah göreceğin yere koy.|ضع ما تحتاجه في مكان تراه صباحًا.',
'Начни с одной страницы, одного шага или одной минуты.|Start with one page, one step, or one minute.|Bir sayfa, bir adım veya bir dakikayla başla.|ابدأ بصفحة أو خطوة أو دقيقة.',
'Сделай выполнение проще, чем пропуск.|Make doing it easier than skipping it.|Yapmayı atlamaktan daha kolay hâle getir.|اجعل التنفيذ أسهل من التجاهل.',
'Проверь, что реально мешает тебе повторять действие.|Find what actually blocks your repetition.|Tekrarı gerçekten neyin engellediğini bul.|حدد ما يمنعك من التكرار فعلًا.',
'Не добавляй пять привычек сразу; закрепи одну.|Do not add five habits at once; establish one.|Bir anda beş alışkanlık ekleme; birini yerleştir.|لا تضف خمس عادات معًا؛ ثبّت واحدة.',
'Отметь последовательность честно, даже если был пропуск.|Track your streak honestly, even after a missed day.|Bir gün atladıysan bile takibini dürüstçe yap.|سجل الاستمرار بصدق حتى إن فاتك يوم.',
'Подготовь простой запасной вариант на трудные дни.|Prepare an easier backup for difficult days.|Zor günler için daha kolay bir alternatif hazırla.|جهز بديلًا أسهل للأيام الصعبة.'
]),
theme('growth',[
'Просмотр уроков не равен освоению навыка.|Watching lessons is not the same as learning a skill.|Ders izlemek beceri kazanmakla aynı şey değil.|مشاهدة الدروس ليست إتقانًا للمهارة.',
'Чтение без применения быстро забывается.|Reading without practice fades quickly.|Uygulamasız okuma çabuk unutulur.|القراءة بلا تطبيق تُنسى سريعًا.',
'Хочешь расти — перестань прятаться от ошибок.|If you want to grow, stop hiding from mistakes.|Gelişmek istiyorsan hatalardan kaçma.|إن أردت التطور فتوقف عن الهروب من الأخطاء.',
'Знание проверяется делом, а не количеством вкладок.|Knowledge is tested in action, not open tabs.|Bilgi, açık sekme sayısıyla değil uygulamayla ölçülür.|يُختبر العلم بالعمل لا بعدد الصفحات المفتوحة.',
'Трудный навык не станет лёгким сам по себе.|A hard skill will not become easy by itself.|Zor bir beceri kendiliğinden kolaylaşmaz.|المهارة الصعبة لن تصبح سهلة وحدها.'
],[
'Примени одну идею на практике сегодня.|Apply one idea in practice today.|Bir fikri bugün uygulamaya geçir.|طبّق فكرة واحدة اليوم.',
'Объясни изученное простыми словами без подсказки.|Explain what you learned in plain words without notes.|Öğrendiğini notlara bakmadan basitçe anlat.|اشرح ما تعلمته بكلمات بسيطة دون ملاحظات.',
'Сделай упражнение, даже если ошибёшься.|Do the exercise even if you might fail.|Hata yapabilecek olsan da alıştırmayı yap.|جرّب التمرين حتى لو أخطأت.',
'Запиши три вещи, которые пока не понимаешь.|Write down three things you still do not understand.|Henüz anlamadığın üç şeyi yaz.|اكتب ثلاثة أمور لم تفهمها بعد.',
'Попроси конкретную обратную связь по своей работе.|Ask for specific feedback on your work.|Çalışman hakkında somut geri bildirim iste.|اطلب ملاحظات محددة على عملك.',
'Вернись к самому слабому месту и потренируй его.|Return to your weakest point and practice it.|En zayıf noktanı seçip onun üzerinde çalış.|ارجع إلى أضعف نقطة وتدرّب عليها.',
'Потрать двадцать минут на создание, а не просмотр.|Spend twenty minutes creating instead of scrolling.|Gezinmek yerine yirmi dakika üret.|اقض عشرين دقيقة في الإنتاج لا التصفح.',
'Проверь результат реальным примером.|Test your result with a real example.|Sonucunu gerçek bir örnekle dene.|اختبر نتيجتك بمثال واقعي.'
]),
theme('recovery',[
'Отдых нужен, но бегство от дел не восстанавливает.|Rest matters, but escaping tasks does not restore you.|Dinlenmek önemlidir ama işlerden kaçmak dinlendirmez.|الراحة مهمة لكن الهروب من المهام لا يعيد نشاطك.',
'Усталость не делает тебя ленивым автоматически.|Being tired does not automatically make you lazy.|Yorulmak otomatik olarak tembel olduğun anlamına gelmez.|التعب لا يعني أنك كسول تلقائيًا.',
'Переутомление ломает планы быстрее перерывов.|Overwork breaks plans faster than real breaks.|Aşırı çalışma planları molalardan hızlı bozar.|الإرهاق يفسد الخطط أسرع من الراحة.',
'Сон — не награда после бесконечной работы.|Sleep is not a prize after endless work.|Uyku sonsuz çalışmanın ödülü değildir.|النوم ليس جائزة بعد عمل بلا نهاية.',
'Сильная дисциплина умеет вовремя остановиться.|Real discipline also knows when to stop.|Gerçek disiplin gerektiğinde durmayı da bilir.|الانضباط الحقيقي يعرف متى يتوقف.'
],[
'Проверь сон, еду и нагрузку без самообмана.|Check your sleep, food, and workload honestly.|Uykunu, beslenmeni ve yükünü dürüstçe değerlendir.|راجع نومك وغذاءك وجهدك بصدق.',
'Сделай короткий перерыв без бесконечной ленты.|Take a short break without endless scrolling.|Sonsuz kaydırma olmadan kısa mola ver.|خذ استراحة قصيرة دون تصفح بلا نهاية.',
'Назначь реальное время завершения работы.|Set a realistic time to stop working.|Çalışmayı bitireceğin gerçekçi bir saat belirle.|حدد وقتًا واقعيًا لإنهاء العمل.',
'Упрости цель на сегодня, если силы действительно кончились.|Scale down today’s goal if you are genuinely drained.|Gerçekten tükendiysen bugünkü hedefi küçült.|خفف هدف اليوم إن نفدت طاقتك حقًا.',
'Убери одну ненужную обязанность из расписания.|Remove one unnecessary commitment from your schedule.|Programından gereksiz bir yükü çıkar.|احذف التزامًا غير ضروري من جدولك.',
'Выйди на короткую прогулку, если это тебе подходит.|Take a short walk if that works for you.|Sana uygunsa kısa bir yürüyüş yap.|تمشَّ قليلًا إن كان مناسبًا لك.',
'Подготовь спокойное окончание дня без экрана.|Plan a calmer screen-free end to your day.|Ekransız sakin bir akşam sonu hazırla.|هيئ نهاية هادئة ليومك بلا شاشة.',
'После отдыха вернись к одной посильной задаче.|After resting, return to one manageable task.|Dinlendikten sonra yapılabilir bir işe dön.|بعد الراحة عد إلى مهمة واحدة ممكنة.'
]),
theme('intention',[
'Сильная цель не спасёт слабый план.|A strong goal cannot save a weak plan.|Güçlü hedef zayıf planı kurtaramaz.|الهدف القوي لا ينقذ خطة ضعيفة.',
'Чужой успех не заменяет твоего собственного движения.|Someone else’s success cannot replace your progress.|Başkalarının başarısı senin ilerlemenin yerini tutmaz.|نجاح غيرك لا يغني عن تقدمك.',
'Мечты без даты остаются разговорами.|Dreams without a date stay conversations.|Tarihi olmayan hayaller sözde kalır.|الأحلام بلا موعد تبقى كلامًا.',
'Направление важнее суеты.|Direction matters more than busyness.|Yön, meşgul görünmekten önemlidir.|الاتجاه أهم من الانشغال.',
'Ты не обязан делать всё, но обязан выбрать главное.|You cannot do everything, but you can choose what matters.|Her şeyi yapamazsın ama önemli olanı seçebilirsin.|لا يمكنك فعل كل شيء لكن يمكنك اختيار الأهم.'
],[
'Напиши главную цель одной простой фразой.|Write your main goal in one clear sentence.|Ana hedefini tek açık cümleyle yaz.|اكتب هدفك الأساسي في جملة واضحة.',
'Укажи конкретный результат на ближайшие семь дней.|Name a concrete result for the next seven days.|Önündeki yedi gün için somut sonuç belirle.|حدد نتيجة ملموسة للأيام السبعة القادمة.',
'Удали из списка дело, которое не ведёт к цели.|Remove one task that does not serve your goal.|Hedefine hizmet etmeyen işi listeden çıkar.|احذف مهمة لا تخدم هدفك.',
'Расскажи меньше, а первый шаг сделай сегодня.|Talk less and take the first step today.|Daha az konuş, ilk adımı bugün at.|قلل الكلام واتخذ أول خطوة اليوم.',
'Проверь, чем ты занят, а чего достиг.|Check what kept you busy versus what you achieved.|Neyle uğraştığını ve ne başardığını karşılaştır.|قارن بين ما شغلك وما أنجزته.',
'Разбей далёкую цель на задачу завтрашнего утра.|Turn a distant goal into tomorrow morning’s task.|Uzak hedefini yarın sabahın işine dönüştür.|حوّل هدفك البعيد إلى مهمة صباح الغد.',
'Не меняй цель из-за одного трудного дня.|Do not abandon a goal over one hard day.|Tek zor gün yüzünden hedefini değiştirme.|لا تتخلَّ عن هدفك بسبب يوم صعب.',
'Покажи результат делом, а не обещаниями.|Let your work speak louder than promises.|Sözlerin değil, yaptığın iş konuşsun.|دع عملك يتحدث بدل الوعود.'
])]

islamic=[
theme('sincerity',[
'Не каждый добрый поступок нуждается в зрителях.|Not every good deed needs an audience.|Her iyi amel seyirci istemez.|ليس كل عمل صالح بحاجة إلى جمهور.',
'Люди видят внешнее, но намерение требует честности.|People see the outside; your intention needs honesty.|İnsanlar dışını görür; niyetin dürüstlük ister.|يرى الناس الظاهر، والنية تحتاج إلى صدق.',
'Похвала людей быстро проходит.|People’s praise fades quickly.|İnsanların övgüsü çabuk geçer.|مديح الناس يزول سريعًا.',
'Искренность начинается до самого поступка.|Sincerity starts before the action.|İhlas amelden önce başlar.|يبدأ الإخلاص قبل العمل.',
'Если никто не узнает о добре, оно не теряет смысла.|An unseen good deed still matters.|Kimse bilmese de iyilik değerini kaybetmez.|الخير لا يفقد قيمته إن لم يره أحد.'
],[
'Перед делом спроси себя, ради Кого ты это делаешь.|Before acting, ask yourself for Whom you do it.|Başlamadan önce bu işi kimin rızası için yaptığını sor.|قبل العمل اسأل نفسك لمن تفعله.',
'Совершай одно доброе дело без рассказов о нём.|Do one good deed without telling anyone.|Kimseye anlatmadan bir iyilik yap.|افعل خيرًا واحدًا دون أن تخبر أحدًا.',
'Не превращай поклонение в соревнование за внимание.|Do not turn worship into a contest for attention.|İbadeti ilgi çekme yarışına çevirme.|لا تجعل العبادة منافسة على الاهتمام.',
'Исправь намерение, даже если уже начал.|Renew your intention even after starting.|Başlamış olsan bile niyetini düzelt.|صحح نيتك حتى بعد أن تبدأ.',
'Не измеряй ценность дела количеством похвал.|Do not measure a deed by its applause.|Bir amelin değerini alkışla ölçme.|لا تقس قيمة العمل بمديح الناس.',
'Поблагодари Аллаха за возможность сделать добро.|Thank Allah for the chance to do good.|İyilik fırsatı için Allah’a şükret.|احمد الله على فرصة فعل الخير.',
'Береги дела, которые остаются между тобой и Аллахом.|Protect deeds that remain between you and Allah.|Seninle Allah arasında kalan amelleri koru.|احفظ الأعمال التي بينك وبين الله.',
'Смотри на пользу поступка, а не на впечатление окружающих.|Focus on the benefit, not people’s impressions.|İnsanların izlenimine değil, amelin faydasına bak.|انظر إلى نفع العمل لا إلى إعجاب الناس.'
],True),
theme('prayer',[
'Намаз не должен оставаться последним пунктом дня.|Prayer should not become your last priority.|Namaz günün son işi olmamalı.|لا تجعل الصلاة آخر أولويات يومك.',
'Суета может заполнить время, если ты не бережёшь его.|Busyness fills the time you fail to protect.|Vaktini korumazsan telaş her yeri doldurur.|الانشغال يملأ الوقت إن لم تحافظ عليه.',
'Собранность в намазе начинается до такбира.|Presence in prayer begins before the takbir.|Namazdaki huzur tekbirden önce başlar.|الخشوع في الصلاة يبدأ قبل التكبير.',
'Дела подождут; обязательный намаз требует внимания.|Tasks can wait; obligatory prayer deserves care.|İşler bekleyebilir; farz namaz özen ister.|يمكن للأعمال أن تنتظر، أما الصلاة المفروضة فتستحق العناية.',
'Регулярность в намазе не строится на случайном настроении.|Steadiness in prayer cannot depend on mood.|Namazda devamlılık anlık ruh hâline bağlı olmamalı.|المداومة على الصلاة لا تُبنى على المزاج.'
],[
'Заранее выдели место для намаза в своём расписании.|Reserve space for prayer in your schedule ahead of time.|Programında namaz için önceden yer ayır.|خصص للصلاة وقتًا في جدولك مسبقًا.',
'Убери телефон перед тем, как встать на молитву.|Put the phone away before standing to pray.|Namaza durmadan önce telefonu uzaklaştır.|أبعد الهاتف قبل أن تقف للصلاة.',
'Подготовь всё необходимое заранее, без спешки.|Prepare what you need ahead of time without rushing.|Gerekenleri acele etmeden önceden hazırla.|جهز ما تحتاجه مسبقًا دون عجلة.',
'Постарайся не откладывать молитву из-за мелких дел.|Try not to delay prayer for small distractions.|Küçük işler yüzünden namazı ertelememeye çalış.|حاول ألا تؤخر الصلاة لأجل أمور صغيرة.',
'Остановись на мгновение и настрой сердце.|Pause briefly and prepare your heart.|Bir an dur ve kalbini hazırla.|توقف لحظة وهيئ قلبك.',
'Учись понимать то, что произносишь в намазе.|Learn the meaning of what you say in prayer.|Namazda okuduklarının anlamını öğren.|تعلم معنى ما تقوله في صلاتك.',
'Планируя день, учитывай пять обязательных молитв.|Plan your day around the five obligatory prayers.|Gününü planlarken beş vakit farz namazı gözet.|راعِ الصلوات الخمس المفروضة عند تخطيط يومك.',
'Если пропустил важное, ищи достоверное знание о том, как исправить.|If you missed an obligation, seek reliable guidance on what to do.|Bir farzı kaçırdıysan nasıl telafi edeceğini güvenilir kaynaktan öğren.|إن فاتك واجب فاطلب توجيهًا موثوقًا حول ما يلزم.'
],True),
theme('repentance',[
'Не позволяй вчерашней ошибке управлять сегодняшним днём.|Do not let yesterday’s mistake control today.|Dünkü hatanın bugününü yönetmesine izin verme.|لا تدع خطأ الأمس يتحكم بيومك.',
'Покаяние — не красивая фраза, а возвращение к добру.|Repentance is not a pretty phrase; it is a return to good.|Tevbe güzel bir söz değil, iyiliğe dönüştür.|التوبة ليست عبارة جميلة بل عودة إلى الخير.',
'Никто из нас не свободен от ошибок.|None of us is free from mistakes.|Hiçbirimiz hatasız değiliz.|لا أحد منا معصوم من الخطأ.',
'Откладывать исправление ошибки — тоже выбор.|Delaying a correction is also a choice.|Hatayı düzeltmeyi ertelemek de bir seçimdir.|تأجيل إصلاح الخطأ اختيار أيضًا.',
'Надежда на милость Аллаха не должна вести к беспечности.|Hope in Allah’s mercy should not turn into carelessness.|Allah’ın rahmetinden umut etmek gaflete dönüşmemeli.|الرجاء في رحمة الله لا ينبغي أن يصبح غفلة.'
],[
'Признай ошибку перед собой без оправданий.|Admit the mistake without making excuses.|Bahane bulmadan hatanı kabul et.|اعترف بالخطأ دون تبرير.',
'Оставь один конкретный поступок, о котором сожалеешь.|Stop one specific action you regret.|Pişman olduğun somut bir davranışı bırak.|اترك فعلًا محددًا تندم عليه.',
'Попроси у Аллаха прощения искренне и спокойно.|Ask Allah for forgiveness sincerely and calmly.|Allah’tan içtenlikle bağışlanma dile.|استغفر الله بصدق وطمأنينة.',
'Если задел чьи-то права, постарайся исправить причинённый вред.|If you harmed someone’s rights, seek to make it right.|Birinin hakkını çiğnediysen zararı telafi etmeye çalış.|إن اعتديت على حق أحد فاسعَ إلى إصلاح الضرر.',
'Не рассказывай о своём грехе ради внимания.|Do not reveal your sin just to get attention.|İlgi görmek için günahını anlatma.|لا تفضح ذنبك طلبًا للاهتمام.',
'Убери то, что постоянно возвращает тебя к ошибке.|Remove what repeatedly pulls you back to the mistake.|Seni hataya geri çeken şeyi uzaklaştır.|أبعد ما يعيدك إلى الخطأ باستمرار.',
'После ошибки начни с одного правильного дела.|After the mistake, begin with one right action.|Hatadan sonra doğru bir işle yeniden başla.|بعد الخطأ ابدأ بفعل صالح واحد.',
'Не лишай себя надежды на исправление.|Do not deny yourself hope of changing.|Düzelebileceğine dair umudunu kaybetme.|لا تحرم نفسك من أمل الإصلاح.'
],True),
theme('gratitude',[
'Многое из привычного сегодня когда-то было мечтой.|Much of what feels normal was once a dream.|Bugün sıradan gelen nice şey bir zamanlar hayaldi.|كثير مما اعتدته اليوم كان يومًا أمنية.',
'Благодарность видна не только в словах.|Gratitude is more than words.|Şükür sadece sözde görünmez.|الشكر ليس كلمات فقط.',
'Не замечая даров, легко стать недовольным всем.|Ignoring blessings makes everything feel lacking.|Nimetleri görmezsen her şey eksik gelir.|إن غفلت عن النعم رأيت كل شيء ناقصًا.',
'Сравнение с другими крадёт спокойствие сердца.|Constant comparison steals peace from the heart.|Sürekli kıyas kalbin huzurunu çalar.|المقارنة المستمرة تسرق راحة القلب.',
'Маленькие блага не перестают быть благами.|Small blessings are still blessings.|Küçük nimetler de nimettir.|النعم الصغيرة تظل نعمًا.'
],[
'Назови три блага, за которые благодаришь Аллаха.|Name three blessings for which you thank Allah.|Allah’a şükrettiğin üç nimeti say.|اذكر ثلاث نعم تحمد الله عليها.',
'Используй один из своих даров на пользу другому.|Use one of your gifts to benefit someone.|Sahip olduğun bir nimeti başkasına fayda için kullan.|استخدم نعمة لديك لنفع غيرك.',
'Не жалуйся автоматически; сначала вспомни о хорошем.|Before complaining, remember what is good.|Şikâyet etmeden önce iyilikleri hatırla.|قبل الشكوى تذكر ما لديك من خير.',
'Поблагодари человека, который тебе помог.|Thank someone who helped you.|Sana yardım eden birine teşekkür et.|اشكر من ساعدك.',
'Посмотри на привычные возможности свежим взглядом.|Look at familiar opportunities with fresh eyes.|Alıştığın imkânlara yeniden dikkat et.|انظر إلى الفرص المعتادة بعين جديدة.',
'Будь бережнее к здоровью, времени и близким.|Treat your health, time, and loved ones with care.|Sağlığına, vaktine ve sevdiklerine özen göster.|احفظ صحتك ووقتك وأهلك.',
'Сделай добрый поступок как выражение благодарности.|Do a kind act as an expression of gratitude.|Şükrünün göstergesi olarak iyilik yap.|افعل خيرًا تعبيرًا عن الشكر.',
'Запиши одно благо, которое обычно не замечаешь.|Write one blessing you usually overlook.|Genelde fark etmediğin bir nimeti yaz.|اكتب نعمة تغفل عنها عادة.'
],True),
theme('patience',[
'Сабр — не просто ждать, пока всё пройдёт.|Sabr is more than waiting for things to pass.|Sabır sadece geçmesini beklemek değildir.|الصبر ليس مجرد انتظار زوال الأمر.',
'Не каждую трудность можно решить немедленно.|Not every hardship can be solved at once.|Her zorluk hemen çözülemez.|ليس كل عسر يُحلّ فورًا.',
'Гнев часто требует ответа раньше разума.|Anger often demands a reply before thought.|Öfke çoğu kez düşünmeden cevap ister.|الغضب يطلب الرد قبل التفكير.',
'Спокойствие не означает отсутствие испытаний.|Calm does not mean a life without trials.|Sakinlik imtihansız hayat demek değildir.|السكينة لا تعني غياب الابتلاء.',
'Терпение проявляется в том, что ты выбираешь сейчас.|Patience shows in what you choose now.|Sabır, şimdi seçtiğin davranışta görünür.|يظهر الصبر فيما تختاره الآن.'
],[
'Прежде чем отвечать, сделай короткую паузу.|Pause briefly before replying.|Cevap vermeden önce kısa bir mola ver.|توقف لحظة قبل الرد.',
'Попроси у Аллаха помощи и сделай посильный шаг.|Ask Allah for help and take a manageable step.|Allah’tan yardım iste ve gücünün yettiği adımı at.|استعن بالله واتخذ خطوة تستطيعها.',
'Не причиняй боль другому из-за своего раздражения.|Do not hurt others because you are upset.|Sinirli olduğun için başkasını incitme.|لا تؤذِ غيرك بسبب غضبك.',
'Отдели то, что можешь изменить, от остального.|Separate what you can change from what you cannot.|Değiştirebildiğinle değiştiremediğini ayır.|ميّز بين ما تقدر على تغييره وما لا تقدر.',
'Выбери мягкий тон, даже если разговор трудный.|Choose a gentle tone even in a hard talk.|Zor konuşmada bile yumuşak bir üslup seç.|اختر لهجة لطيفة ولو كان الحديث صعبًا.',
'Не требуй от себя мгновенного результата.|Do not demand instant results from yourself.|Kendinden anında sonuç bekleme.|لا تطالب نفسك بنتيجة فورية.',
'Обратись за поддержкой, если испытание слишком тяжело.|Seek support if a trial feels too heavy.|Sınav ağır geliyorsa destek iste.|اطلب الدعم إن اشتد عليك البلاء.',
'Продолжай доброе дело в разумном, посильном темпе.|Keep doing good at a sustainable pace.|İyiliğe gücünün yettiği ölçüde devam et.|واصل الخير بقدر طاقتك.'
],True),
theme('speech',[
'Одно необдуманное слово может ранить надолго.|One careless word can hurt for a long time.|Düşüncesiz bir söz uzun süre incitebilir.|كلمة طائشة قد تجرح طويلًا.',
'Не всякая правда нуждается в грубой подаче.|Truth does not require a harsh delivery.|Doğruyu söylemek kabalık gerektirmez.|الحق لا يحتاج إلى قسوة في القول.',
'Сплетня не становится добром от красивых слов.|Gossip does not become good through polite words.|Dedikodu güzel sözlerle iyiliğe dönüşmez.|الغيبة لا تصبح خيرًا بالتلطيف.',
'Сдержанный язык сохраняет многие отношения.|A restrained tongue protects relationships.|Diline sahip çıkmak birçok ilişkiyi korur.|حفظ اللسان يصون علاقات كثيرة.',
'Твои сообщения тоже часть твоего нрава.|Your messages are part of your character too.|Yazdığın mesajlar da ahlakının parçasıdır.|رسائلك أيضًا جزء من أخلاقك.'
],[
'Перед отправкой сообщения перечитай его спокойно.|Reread a message calmly before sending.|Mesajı göndermeden sakinlikle tekrar oku.|اقرأ رسالتك بهدوء قبل إرسالها.',
'Сегодня не участвуй в обсуждении чужих недостатков.|Today avoid discussing another person’s faults.|Bugün başkasının kusurunu konuşmaya katılma.|امتنع اليوم عن الحديث في عيوب الآخرين.',
'Скажи правду без оскорблений и насмешек.|Speak truth without insults or mockery.|Doğruyu hakaret ve alay olmadan söyle.|قل الحق دون إهانة أو سخرية.',
'Если ошибся словами, извинись прямо.|If you hurt someone with words, apologize directly.|Sözlerinle kırdıysan açıkça özür dile.|إن آذيت بكلامك فاعتذر بوضوح.',
'Не пересылай новость, пока не проверил её.|Do not forward news before verifying it.|Doğrulamadan haber paylaşma.|لا تنقل خبرًا قبل التحقق منه.',
'Выслушай собеседника до конца.|Listen to the other person to the end.|Karşındakini sonuna kadar dinle.|استمع إلى المتحدث حتى النهاية.',
'Замени резкий ответ коротким спокойным объяснением.|Replace a sharp reply with a calm explanation.|Sert cevabı kısa ve sakin açıklamayla değiştir.|استبدل الرد القاسي بتوضيح هادئ.',
'Промолчи, если слова сейчас только усугубят конфликт.|Stay silent if speaking now would worsen the conflict.|Şimdi konuşmak tartışmayı büyütecekse sus.|اصمت إن كان كلامك الآن سيزيد الخلاف.'
],True),
theme('family',[
'Близкие нуждаются в твоём внимании, не только в обещаниях.|Loved ones need your attention, not just promises.|Yakınların sadece sözlerine değil, ilgine de ihtiyaç duyar.|أهلك يحتاجون اهتمامك لا وعودك فقط.',
'Уважение к родителям проявляется в повседневных мелочах.|Respect for parents shows in everyday details.|Anne babaya saygı günlük davranışta görünür.|بر الوالدين يظهر في تفاصيل اليوم.',
'Хороший нрав дома важен не меньше, чем на людях.|Good character at home matters as much as in public.|Evde güzel ahlak, toplum içindeki kadar önemlidir.|حسن الخلق في البيت لا يقل أهمية عن خارجه.',
'Не позволяй занятости уничтожить связь с семьёй.|Do not let busyness destroy family ties.|Yoğunluğun aile bağlarını koparmasına izin verme.|لا تجعل الانشغال يقطع صلتك بأهلك.',
'Грубость дома не становится нормой от усталости.|Being tired does not excuse cruelty at home.|Yorgunluk evde kabalığı normalleştirmez.|التعب لا يبرر القسوة في البيت.'
],[
'Позвони родному человеку и спроси, как он на самом деле.|Call a relative and genuinely ask how they are.|Bir yakınını ara ve gerçekten nasıl olduğunu sor.|اتصل بقريب واسأله بصدق عن حاله.',
'Помоги дома с делом без просьб и напоминаний.|Help at home without being asked.|Söylenmeden evde bir işe yardım et.|ساعد في البيت دون أن يطلب منك أحد.',
'Ответь родителям мягко, даже если устал.|Answer your parents gently, even when tired.|Yorgun olsan da anne babana yumuşak cevap ver.|أجب والديك برفق ولو كنت متعبًا.',
'Удели семье время без телефона.|Give your family phone-free time.|Ailene telefonsuz zaman ayır.|خصص لأهلك وقتًا بلا هاتف.',
'Извинись за резкие слова, если был неправ.|Apologize for harsh words if you were wrong.|Haksızsan sert sözlerin için özür dile.|اعتذر عن كلام قاسٍ إن أخطأت.',
'Выслушай человека, не перебивая.|Listen without interrupting.|Karşındakinin sözünü kesmeden dinle.|استمع دون مقاطعة.',
'Сделай небольшое добро близкому тайно.|Do a small kindness for a loved one quietly.|Bir yakınına gösterişsiz iyilik yap.|قدم خيرًا صغيرًا لأحد أهلك دون ضجة.',
'Сохраняй границы уважительно, не причиняя вреда себе.|Keep healthy boundaries respectfully and safely.|Sağlıklı sınırlarını saygıyla ve güvenle koru.|احفظ حدودك الصحية باحترام وأمان.'
],True),
theme('remembrance',[
'Сердцу нужен не только поток новостей.|The heart needs more than a stream of news.|Kalbin haber akışından fazlasına ihtiyacı var.|القلب يحتاج إلى ما هو أكثر من الأخبار.',
'Постоянная суета делает тихое поминание труднее.|Constant noise makes quiet remembrance harder.|Sürekli telaş sakin zikri zorlaştırır.|الضجيج المستمر يصعّب الذكر الهادئ.',
'Не оставляй поминание Аллаха только на тяжёлые дни.|Do not remember Allah only on hard days.|Allah’ı anmayı yalnızca zor günlere bırakma.|لا تجعل ذكر الله للأيام الصعبة فقط.',
'Короткая пауза может вернуть твоё внимание к главному.|A brief pause can return your attention to what matters.|Kısa bir duraklama dikkatini asıl olana döndürebilir.|قد تعيدك وقفة قصيرة إلى الأهم.',
'Занятость не обязана вытеснять духовную жизнь.|Being busy need not push out spiritual life.|Yoğunluk manevi hayatını dışlamak zorunda değil.|الانشغال لا يلزم أن يطرد حياتك الروحية.'
],[
'Выдели спокойную минуту для зикра.|Set aside a quiet minute for dhikr.|Zikir için sakin bir dakika ayır.|خصص دقيقة هادئة للذكر.',
'Помяни Аллаха без спешки и показухи.|Remember Allah without rushing or showing off.|Acele etmeden ve gösterişsiz Allah’ı an.|اذكر الله بلا عجلة ولا رياء.',
'Отключи экран на несколько минут и соберись.|Turn off your screen for a few minutes and refocus.|Ekranı birkaç dakikalığına kapat ve toparlan.|أغلق الشاشة لدقائق واستجمع قلبك.',
'Постарайся замечать благие поводы вспомнить об Аллахе.|Look for good moments to remember Allah.|Allah’ı anmak için güzel anları fark et.|انتبه إلى المناسبات الطيبة لذكر الله.',
'Соедини обычное доброе дело с правильным намерением.|Connect an ordinary kind deed with good intention.|Günlük iyiliğini güzel bir niyetle birleştir.|اربط الخير اليومي بنية صالحة.',
'Не соревнуйся в количестве; береги искренность.|Do not compete in numbers; protect sincerity.|Sayı yarışına girme; ihlasını koru.|لا تنافس في العدد واحفظ الإخلاص.',
'Найди тихое место для короткого размышления.|Find a quiet place for brief reflection.|Kısa tefekkür için sakin bir yer bul.|ابحث عن مكان هادئ لتأمل قصير.',
'Сделай напоминание о зикре мягким, а не навязчивым.|Let your dhikr reminder be gentle, not oppressive.|Zikir hatırlatıcın baskıcı değil, nazik olsun.|اجعل تذكير الذكر لطيفًا لا مرهقًا.'
],True),
theme('time',[
'День проходит независимо от твоих намерений.|The day passes regardless of your intentions.|Niyetinden bağımsız olarak gün geçip gider.|يمضي اليوم مهما كانت نواياك.',
'Свободное время — доверенное тебе благо.|Free time is a blessing entrusted to you.|Boş vakit sana emanet edilmiş bir nimettir.|الفراغ نعمة أُودعت عندك.',
'Не каждая занятость приближает к полезному.|Not every busy hour brings you closer to good.|Her meşguliyet seni hayra yaklaştırmaz.|ليس كل انشغال يقربك من الخير.',
'Отложенное добро может так и остаться намерением.|Delayed good may remain an intention forever.|Ertelenen iyilik sadece niyet olarak kalabilir.|الخير المؤجل قد يبقى مجرد نية.',
'Сутки ограничены; важно то, чем ты их наполняешь.|Days are limited; what fills them matters.|Gün sınırlıdır; onu neyle doldurduğun önemlidir.|الأيام محدودة والعبرة بما تملؤها به.'
],[
'Запланируй сегодня одно полезное дело для других.|Plan one helpful deed for someone today.|Bugün başkası için bir faydalı iş planla.|خطط اليوم لعمل نافع لغيرك.',
'Проверь, сколько времени уходит на бесцельную ленту.|Check how much time you give to aimless scrolling.|Amaçsız kaydırmaya harcadığın süreye bak.|راجع الوقت الذي تضيعه في التصفح بلا هدف.',
'Выдели в расписании место для учёбы и поклонения.|Make room for learning and worship in your schedule.|Programında ilim ve ibadete yer ayır.|خصص وقتًا للتعلم والعبادة في جدولك.',
'Не откладывай звонок родителям без причины.|Do not delay calling your parents without reason.|Sebepsiz yere anne babanı aramayı erteleme.|لا تؤجل الاتصال بوالديك بلا سبب.',
'Сделай полезную работу до долгого отдыха в сети.|Do useful work before long online leisure.|Uzun çevrim içi moladan önce faydalı bir iş yap.|أنجز عملًا نافعًا قبل الترفيه الطويل على الإنترنت.',
'Оставь немного времени для честного самоанализа.|Save a little time for honest self-reflection.|Samimi bir muhasebe için biraz zaman ayır.|اترك وقتًا يسيرًا لمحاسبة نفسك بصدق.',
'Не превращай планы в причину забывать о близких.|Do not let plans make you neglect loved ones.|Planların yüzünden yakınlarını unutma.|لا تجعل الخطط سببًا لإهمال أحبائك.',
'Заверши день благодарностью Аллаху, а не только списком дел.|End the day thanking Allah, not just checking tasks.|Günü yalnızca yapılacaklarla değil, Allah’a şükürle bitir.|اختم اليوم بحمد الله لا بمجرد قائمة المهام.'
],True),
theme('character',[
'Хороший нрав проверяется там, где тебе невыгодно быть добрым.|Good character is tested when kindness costs you.|Güzel ahlak, iyilik zor geldiğinde sınanır.|يُختبر حسن الخلق حين تكون الطيبة صعبة.',
'Высокомерие может скрываться за красивыми словами.|Pride can hide behind beautiful words.|Kibir güzel sözlerin arkasına saklanabilir.|قد يختبئ الكبر خلف الكلام الجميل.',
'Ошибки других не дают права унижать их.|Other people’s mistakes do not give you a right to humiliate.|Başkalarının hatası onları aşağılama hakkı vermez.|أخطاء الآخرين لا تمنحك حق إهانتهم.',
'Благочестие не измеряется твоим превосходством над людьми.|Piety is not measured by feeling above others.|Takva, başkalarından üstün hissetmekle ölçülmez.|لا يُقاس التقوى بالشعور بالتفوق على الناس.',
'Красивые слова о религии требуют красивого поведения.|Beautiful talk about faith demands good conduct.|Din hakkında güzel sözler güzel davranış ister.|الكلام الجميل عن الدين يحتاج إلى خلق جميل.'
],[
'Проверь сегодня, не обидел ли ты кого-то своим тоном.|Check whether your tone hurt anyone today.|Bugün üslubunla birini kırıp kırmadığını düşün.|راجع هل جرحت أحدًا بلهجتك اليوم.',
'Помоги человеку, не ожидая благодарности.|Help someone without expecting thanks.|Teşekkür beklemeden birine yardım et.|ساعد شخصًا دون انتظار الشكر.',
'Прими справедливую критику без нападения в ответ.|Accept fair criticism without attacking back.|Haklı eleştiriyi saldırmadan kabul et.|تقبل النقد العادل دون هجوم.',
'Избегай насмешек даже тогда, когда другие смеются.|Avoid mockery even when others laugh.|Herkes gülse bile alaydan uzak dur.|ابتعد عن السخرية ولو ضحك الآخرون.',
'Будь мягче с теми, кто слабее тебя.|Be gentler with those who have less power.|Senden güçsüz olanlara karşı daha nazik ol.|ارفق بمن هو أضعف منك.',
'Сделай поступок, которым подкрепишь свои слова.|Back up your good words with a real action.|Güzel sözünü gerçek bir davranışla destekle.|أيّد كلامك الحسن بفعل حقيقي.',
'Не считай себя выше человека из-за его ошибки.|Do not see yourself as above someone for their mistake.|Hatası yüzünden kendini birinden üstün görme.|لا ترَ نفسك فوق أحد بسبب خطئه.',
'В конце дня спроси, кому ты принёс пользу.|At day’s end ask whom you helped.|Günün sonunda kime faydan dokunduğunu sor.|اسأل نفسك آخر اليوم من انتفع بك.'
],True)]

old=json.loads((ROOT/'content/motivation.json').read_text())
legacy_path=ROOT/'content/motivation-legacy-favorites.json'
legacy=json.loads(legacy_path.read_text());legacy_by_id={x['id']:x for x in legacy}
for x in old:
 if not x['id'].startswith(('nafs-drive-','nafs-nasihah-')):legacy_by_id.setdefault(x['id'],x)
legacy_by_id={k:v for k,v in legacy_by_id.items() if not k.startswith(('nafs-drive-','nafs-nasihah-'))}
legacy_path.write_text(json.dumps(list(legacy_by_id.values()),ensure_ascii=False,indent=2)+'\n')

out=[]
for group in (regular,islamic):
 for cat,hooks,actions,faith in group:
  for hi,hook in enumerate(hooks):
   for ai,action in enumerate(actions):
    i=hi*8+ai+1
    texts={lang:hook[lang]+' '+action[lang] for lang in ('ru','en','tr','ar')}
    # In Islamic mode the faith flag distinguishes the entire selection pool.
    contexts=['today','before']
    if cat in (('patience','gratitude','remembrance') if faith else ('resilience','recovery','impulses')):contexts.append('sos')
    if cat in (('repentance','patience') if faith else ('resilience','recovery')):contexts.append('setback')
    if cat in (('gratitude','sincerity','character') if faith else ('consistency','growth','habits')):contexts.append('completed')
    if cat in (('time','sincerity','character') if faith else ('consistency','discipline','intention')):contexts.append('marathon')
    out.append(dict(id=f"nafs-{'nasihah' if faith else 'drive'}-{cat}-{i:02d}",category=cat,contexts=contexts,faith=faith,text=texts))
assert len(out)==800 and sum(x['faith'] for x in out)==400
assert len({x['id'] for x in out})==800
for lang in ('ru','en','tr','ar'):assert len({x['text'][lang] for x in out})==800
(ROOT/'content/motivation.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
labels={
'sincerity':('Искренность','Sincerity','İhlas','الإخلاص'),
'prayer':('Намаз','Prayer','Namaz','الصلاة'),
'repentance':('Покаяние','Repentance','Tevbe','التوبة'),
'gratitude':('Благодарность','Gratitude','Şükür','الشكر'),
'patience':('Терпение','Patience','Sabır','الصبر'),
'speech':('Слова','Speech','Dil ve söz','اللسان'),
'family':('Семья','Family','Aile','الأسرة'),
'remembrance':('Поминание Аллаха','Remembrance','Zikir','الذكر'),
'time':('Время','Time','Zaman','الوقت'),
'character':('Нрав','Character','Ahlak','الأخلاق')}
for pos,lang in enumerate(('ru','en','tr','ar')):
 path=ROOT/'messages'/f'{lang}.json';data=json.loads(path.read_text());
 for category,label in labels.items():data['motivation.category.'+category]=label[pos]
 path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print('Generated 400 regular + 400 Islamic messages (ru,en,tr,ar) and preserved',len(legacy_by_id),'legacy favorites')
