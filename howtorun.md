# Запуск текущей версии

Плагин CONTExt постоянно совершенствуется. Периодически выпускаются новые версии, доступные для установки через официальные каталоги расширений Chrome и Mozilla. 
В промежутках между выходом версий текущие обновления загружаются в репозитарий без упаковки, просто в виде исходных кодов. Для целей тестирования, вы можете запустить в своем браузере такой промежуточный вариант. 

### Шаг 1. 
Скачайте код всего проекта - самый простой способ это использовать линк ***"Скачать ZIP"*** из меню, которое появляется при нажатии на зеленую кнопку Code сверху справа над списком файлов. Также, можно использовать команду git clone - подробности смотрите в описании к системе git.

### Шаг 2. 
Так как плагин предназначен для двух семейств браузеров, то некоторые файлы являются универсальными, а некоторые - специфичны для Mozilla и Chrome. Создайте отдельную директорию для файлов плагина, скопируйте туда - в зависимости от вашего браузера, содержимое директории chrome — для Chrome и браузеров на его основе, и firefox — для Mozilla Firefox и его потомков.
Туда-же скопируйте из основной директории проекта следующие файлы:<br>
FileSaver.js <br>
addhistorydialog.html <br>
contws.js <br>
ddmenu.css <br>
initfirst.js <br> 
mutation.js <br>
tabs.css <br>

В эту же директорию скопируйте всю папку icons из корня проекта.


### Шаг 3. 
Создайте резервную копию Ваших данных плагина (с помощью кнопки ***Экспорт*** на закладке ***Общие*** параметров расширения).

### Шаг 4. 
Подготовьте браузер к установке. Необходимо, чтобы в используемом браузуре не было установлено предыдущего релиза CONTExt. Можно просто его удалить (не забудьте - все данные при этом тоже сотрутся), но рекомендуется создать дополнительный профиль специально для тестирования.

О создании профилей для Chrome и браузеров на его основе рассказано здесь:<br>
https://support.google.com/chrome/answer/2364824

О создании профилей в Firefox:<br>
https://support.mozilla.org/en-US/kb/profile-manager-create-remove-switch-firefox-profiles

### Шаг 5. 
Загрузите плагин в виде не запакованного исходника. Для этого:

В Chrome: откройте страницу загруженных расширений (chrome://extensions/ в адресной строке), включите ***Режим разработчика*** (Developer mode).

![Developer mode](https://github.com/dmiandr/context/blob/master/docs/img/devmode_chrome.png)

После чего на странице появится кнопка ***Загрузить не запакованные*** (Load unpacked)
Нажмите на нее, после чего укажите директорию, в которой вы собрали все файлы плагина.

в Mozilla: откройте страницу отладки расширений (введите в адресной строке about:debugging#/runtime/this-firefox) после чего нажмите на кнопку ***Load Temporary Add-on...*** и укажите файл ***manifest.json*** в папке, в которую вы собрали все файлы исходного кода расширения.