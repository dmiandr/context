# Context RepuTracker
Индивидуальный менеджер репутаций пользователей социальных сетей, оформленный как расширение для браузера (webextension)
Перечень поддерживаемых социальных сетей расширяется, на данный момент поддерживаются следующие соцсети:
- Континенталист (CONT.ws)
- Вконтакте (vk.com)
- Живой Журнал (livejournal.com)


### Основная идея

При использовании социальных сетей, особенно в обсуждении острых тем, мы можем встретиться с огромным количеством самых разных людей. Их настолько много, что человек не может их запомнить. А порой понять смысл и цель чужого высказывания можно только обладая информацией о предыдущих поступках собеседника. Ведь человек — это, по-сути — сумма всех его предыдущих действий. Конечно, можно каждый раз обращаться к профилю пользователя, читать его последние публикации или комментарии и составлять представление о нем. Но это займет много времени, всех встречных собеседников так не проверишь, кроме того — нужное вам высказывание, характеризующее человека может оказаться погребенным под грудой других где-то в обсуждении многолетней давности. А может быть вовсе стерто — модераторами или самим автором. В результате, собеседник — хотя и имеет имя, аватар и профиль — в самом важном аспекте остается для вас анонимным. Вы видите плоскую картину — то, что пользователь написал прямо сейчас, но не видите глубины — что он делал ранее.

Расширение Context RepuTracker представляет собой концептуальное решение  данной проблемы. Вместо того, чтобы пытаться запомнить каждого встречного собеседника, вы можете зафиксировать его высказывание в истории пользователя. При следующей встрече с данным человеком расширение напомнит вам, что вы уже встречали данного пользователя, какие его высказывания показались вам важными, какие именно выводы вы сделали. При этом отбор высказываний и их характеристика осуществляется лично вами — никакая сторонняя манипуляция с целью искажения образа собеседника оказывается невозможна в принципе. Данные о событиях хранятся локально, во встроенной БД вашего браузера – поэтому недоступны никому, кроме вас, отредактировать или удалить сведения о том ли ином событии можете только вы. 

### Техническая реализация

Расширение позволяет сохранять в истории высказывания пользователей поддерживаемых платформ, и вызывать получившееся досье на встречного пользователя в один клик. Для этого расширение ищет на открытой вами странице все ссылки на пользователей. Все ссылки подразделяются на ***события*** и ***упоминания***. 
	***Событие (потенциальное)*** — это фрагмент, содержащий законченное высказывание пользователя, которое можно сохранить в истории высказываний. Главная черта события — это наличие уникальной ссылки. Также у события есть время создания и может быть заголовок.
	***Упоминание*** — это просто любая ссылка на пользователя, не содержащая достаточно информации для создания события. Это может быть ссылка на публикацию — с заголовком и данными о времени, но с обрезанным или вовсе отсутствующим текстом, это может быть просто ссылка на пользователя в списке подписчиков или в дополнительных секциях, вроде наиболее популярных материалов. В отличии от потенциального события, в упоминании нет достаточных данных, чтобы его можно было добавить к истории.
На практике, событиями являются только ***публикации*** и ***комментарии***. Расширение снабжает все потенциальные события меню — треугольничек перед именем пользователя. В публикации меню добавляется к верхней ссылке на пользователя, рядом с заголовком. Все остальные ссылки на пользователей — из шапки, ленты публикаций, боковых блоков и др — являются упоминаниями. Упоминания также могут снабжаться меню — но только, если для данного пользователя уже было сохранено хотя-бы одно событие. В этом случае  количество запомненных событий отображается с помощью цифры в правой части имени пользователя — как в событиях, так и в упоминаниях.
Некоторые ссылки, например из страницы настроек, считаются служебными и полностью игнорируются.
Верхний пункт этого меню представляет собой логин (не псевдоним) пользователя и количество ассоциированных с ним событий (в скобках). При его выборе открывается окно свойств данного пользователя. В меню, которое добавляется к потенциальным событиям также появляется дополнительно пункт добавления/редактирования событий:

![вид меню потенциального события](https://github.com/dmiandr/context/blob/master/docs/img/menu_plain.png)

### Добавление события
При выборе пункта меню "Добавить к истории" открывается окно описания события:

![окно описания события - новое событие](https://github.com/dmiandr/context/blob/master/docs/img/addevent.png)

Данные события считываются со страницы. Часть из них не редактируемые - тип события, автор, время, ссылка и т.д. Часть могут быть отредактированы пользователем - заголовок, основной текст, признак репоста, список тегов, характеризующих событие. Кнопка "Добавить" сохраняет данные в бд и закрывает окно. После сохранения события, счетчик событий увеличивается на единицу, а имя автора, являющееся ссылкой, связанной с событием, выделяется графически - начинает мигать.

_Обратите внимание, что дата и время события не всегда определяются правильно, в некоторых социальных сетях количество вариантов формата штампа времени очень велико и зависит от пользовательских настроек (например в LiveJournal). На этот случай поле даты также является редактируемым (за исключением FireFox версий старше 91-й, там эта функция не доступна по техническим причинам), а исходный текст, обозначающий даты вывешивается как всплывающая подсказка над этим полем. Для того, чтобы включить редактирование, используйте двойной клик на самом краю поля даты_

### Редактирование/Удаление события

Если данное упоминание автора уже является событием, то есть уже было добавлено к истории, то имя автора на странице мигает, второй пункт в меню называется "Изменить событие". Он открывает окно описания существующего события:

![окно описания события - существующее событие](https://github.com/dmiandr/context/blob/master/docs/img/editevent.png)

Данные события берутся из базы данных. Кнопка "Изменить" сохраняет отредактированное событие, кнопка "Удалить" удаляет его из базы и закрывает окно.

### Добавление и редактирование тегов

В окне описания события под строкой с уникальным адресом события располагается редактор тегов. Теги — это текстовые метки, характеризующие событие. Программа не навязывает никаких конкретных меток, их необходимо придумывать самому. Рекомендуется использовать короткие текстовые строки, характеризующие событие с какой-то типовой точки зрения, чтобы идентичный тег можно было использовать для характеристики многих событий. Если в качестве тега используется длинная комплексная характеристика — подумайте, нельзя ли разделить ее на два разных тега. Более детальные рекомендации по формулировке тегов будут опубликованы позже.
Технически, редактор тегов первоначально выглядит как поле с блеклой надписью «Введите тег» после чего в скобках указывается общее количество различных тегов, примененных в базе — в начале это 0:

![событие с нулевым количеством тегов](https://github.com/dmiandr/context/blob/master/docs/img/editevent.png)

Для добавления тега достаточно вписать его в это поле и нажать Enter — после чего введенный тег превратится в серую плашку, а поле ввода тега сдвинется вправо-вниз. Уже введенные теги снабжаются кнопкой удаления — крестиком в правой части:

![событие с одним добавленным тегом](https://github.com/dmiandr/context/blob/master/docs/img/editevent_tag.png)

Отредактировать тег нельзя, можно только удалить и ввести заново. При нажатии на кнопку «Вниз» (для Mozilla) выводится выпадающий список подсказывающий уже использовавшиеся в базе теги, по которому можно осуществлять контекстный поиск и выбор тега из списка уже использовавшихся. В Chrome этот список открывается автоматически. Эта функция предназначена для соблюдения идентичности написания тегов.

### Просмотр досье пользователя

Для каждого автора верхний пункт контекстного меню открывает окно, содержащее собранные сведения о пользователе:

![досье](https://github.com/dmiandr/context/blob/master/docs/img/hist_window.png)

В верхней части окна расположены название социальной сети, псевдоним и в скобках — логин автора. Слева от этой строки находится меню, позволяющее назначать статус пользователя (ранее оно было размещено непосредственно на странице блога, но было перенесено сюда, так как логичнее назначать статус на основании каких-то уже сделанных наблюдений над человеком). После изменения статуса, не забудьте нажать кнопку "Сохранить"! 

Ниже расположено редактируемое поле, в котором можно разместить детальное описание автора - итог всей истории наблюдений. Под текстовым полем - галочка "скрыть данного пользователя", отметив которую вы уберете комментарии данного пользователя из всех дискуссий - они будут вам не видны. В правом верхнем углу расположены кнопки "Закрыть", закрывающая все окно, "Обновить" обновляющая список в окне и "Сохранить" — кнопка, сохраняющая отредактированное текстовое описание автора, его статус и видимость комментариев пользователя. (Обратите внимание, без нажатия «Сохранить» эти данные не будут сохранены).
Ниже расположено облако тегов, соответствующее событиям данного пользователя. При достаточном числе событий, это облако представляет собой «портрет» пользователя.
Еще ниже - таблица, содержащая список событий. В таблице есть три колонки: Время, Заголовок и Событие. Первая содержит дату и время события. Вторая колонка содержит заголовок события, одновременно являющийся ссылкой, открывающей окно описания события — таким образом уже существующее событие можно отредактировать или удалить. Третья колонка показывает тип события (Комментарий или Запись), которая одновременно является ссылкой на событие, страница открывается в новой вкладке основного окна.

### Параметры расширения

Параметры открываются стандартным способом, через список активных расширений браузера. Страница параметров расширения разделена на две закладки, «Общие» и «Теги». Закладка «Общие» включает в себя функции Экспорта данных в выбранную директорию в формате json, импорта данных из такого файла. Опция «Удалить данные перед импортом новых»  по умолчанию не активна, поэтому загруженные события прибавляются к уже существующим, кроме тех случаев когда уникальные линки событий совпадают.

Ниже расположена статистическая информация о данных в базе — количество событий, количество разных пользователей, текстовых описаний и данные последнего добавленного события (обратите внимание — последнего по времени создания, а не по времени добавления. Программа не запоминает, когда вы внесли событие в базу, только время создания самого события). 

Следующим идет фильтр, отображающий интерактивный список поддерживаемых соцсетей. По умолчанию выбраны все сети, но вы можете выбрать только часть из них (чтобы выбрать более одного пункта зажмите клавишу Ctrl и выделяйте пункты мышкой). В перечне пользователей будут отображаться только пользователи выбранных соцетей.

Далее располагается редактор статусов пользователей, одновременно включающий функцию фильтрации пользователей по назначенному статусу. Редактор состоит из таблицы, каждая строка которой соответствует одному статусу, кроме того сверху добавлена строка для пользователей, которым не назначался статус, а снизу - строка для добавления нового статуса:

![фильтр/редактор статусов](https://github.com/dmiandr/context/blob/master/docs/img/rankseditor.png)

В режиме фильтра используются только "флажки" в первой колонке таблицы. При отметке флажка, пользователи с указанным статусом перечисляются в таблице в нижней части страницы. Можно отметить несколько флажков - тогда пользователи будут объединены в одну таблицу, с сохранением цветовой маркировки.
В этой таблице, первая колонка содержит логин автора, он же является ссылкой, открывающей список событий этого конкретного автора. Вторая колонка - псевдоним автора, раскрашенный в соответствии с назначенным статусом. Последняя - общее количество событий у данного автора. Если автор отмечен как скрытый, то логин автора пишется наклонным шрифтом.

Для редактирования статуса нажмите на кнопку с "..." в соответствующей строке. Интерфейс перейдет в режим редактирования, названия и описание статуса станут доступны для редактирования. Также можно изменить цвет шрифта и цвет фона, которым отображается данный статус - для этого используются цветные квадратики слева от кнопки редактирования:

![фильтр/редактор статусов в режиме редактирования](https://github.com/dmiandr/context/blob/master/docs/img/rankseditor_editing.png)

На всех не подписанных органах управления имеются всплывающие подсказки. После внесения изменений их можно либо отменить (с помощью кнопки "Отмена", последняя в строке), либо сохранить, повторно нажав на кнопку "...".
Чтобы добавить новый статус, используйте кнопку "+" в последней строке редактора - в остальном функционал идентичен редактированию.
Для удаления статуса используется кнопка "Удалить". Эта кнопка активна только если ни один из пользователей в базе не имеет такого статуса, назначенный хоть кому-то статус удалить нельзя. Количество пользователей, имеющих данный статус отображается в третьей колонке редактора.
Изменить статус пользователя можно из диалога параметров пользователя (не забывайте сохранять сделанное изменение), но после изменения необходимо заново перестроить список статусов. Для этого можно использовать кнопку "Обновить" слева над редактором.

На вкладке «Теги» расположено облако тегов всех событий, имеющихся в базе. В отличии от облака тегов индивидуального пользователя, это облако позволяет осуществлять поиск по базе событий, помеченных любым заданным тегом. Для этого каждый из тегов снабжен флажком. При выборе флажка — в нижней части страницы, под облаком, отображаются все события, помеченные данным тегом. Формат этого отображения следующий — отображается имя пользователя, на темном фоне, после чего подпунктом отображается таблица на светлом фоне со списком связанных с данным пользователем событий. Внешний вид приведен на рисунке:

![облако тегов с результатами поиска](https://github.com/dmiandr/context/blob/master/docs/img/tagscloud.png)

Как имя пользователя, так и заголовок комментария являются ссылками — и открывают соответствующие диалоги, позволяющие вносить изменения. 
Обратите внимание, что при редактировании тегов события, облако тегов автоматически не перестраивается (чтобы не перестраивать его каждый раз когда вносится хоть какое-то изменение). Для обновления списка/количества тегов в облаке предназначена кнопка «Обновить» в левой части окна, над облаком. В правой части размещена кнопка очистки всех выделенных тегов, обнуляющая критерии отбора событий.


Подробности, текущие объявления и обсуждения ведутся в блоге https://cont.ws/@dmitrevo

Благодарю авторов следующих библиотек, задействованных в расширении/Acknowledgments to authors of the following libraries, used in extension:
* https://github.com/mozilla/webextension-polyfill
* https://github.com/eligrey/FileSaver.js

