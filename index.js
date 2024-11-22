const { Telegraf, Markup } = require('telegraf');
const config = require('./config');
const fs = require('fs');
const { writeToCSV } = require('./utils/writecvs')
const bot = new Telegraf(config.telegramToken);
const forStates = require('./utils/forStates')
var inputMode = {};
var userProjects = {};
var namesProjChoise = {}
var currentTime = {}
var isDateToRevind = {}
const projects = ["entry.744013520", "entry.460071324", "entry.114962959", "entry.1174823241","entry.1315587285","entry.1271011164","entry.798682550","entry.529707128","entry.864116383","entry.1277828144","entry.648396435","entry.1609659424","entry.1958276645","entry.1624308407","entry.1731444995","entry.1817660369","entry.1286147655","entry.1631343816","entry.267764195","entry.548035864","entry.1290202242","entry.1682447098","entry.351380903","entry.1867198783","entry.839054733","entry.2029053668","entry.222491728","entry.435825602","entry.842585678","entry.349424234","entry.1532343057","entry.1546192729","entry.225131034","entry.1558092545","entry.923080069","entry.800611585","entry.570852682","entry.1792627242","entry.626348380","entry.272220642","entry.1550213116","entry.1832892167","entry.1491611559","entry.460562156","entry.983334088","entry.49608760","entry.673000119","entry.535142438","entry.604339736","entry.1541318123","entry.1768968497","entry.48700471","entry.1021887040","entry.1403719617"];
const projectsNames = ["Отпуск/больничный/отгул","Алкорамка-Про", "Алкозамок-П-01", "Алкозамок-П-02", "Алкозамок-М","Алкозамок-М-ПРО","Алкозамок-П-ПРО","ВОЛЗ-0.9","ВОЛЗ-СИ","Газоанализатор","ИВЛ/ПЛВ","Изготовление деталей (СИГНАЛ)","М-350 МАИ","М-350 УУНИТ","М-350 УПКБ","М-250 УПКБ","М-350 ПНППК","М-350 ИСС","М-350 Самара","м-350 ПНИПУ","М-350 ЦАТ","М-350 ЦАТ-ОСНОВА","М-350 КБХА","М-450-М УЗГА","М-450-М Тула","М-450-М Силовые машины","КСО","Луч-1","Облакомер (Skydex-15)","Skydex-9","Одиссей","ПВЛ 300 Байконур","Прометей","Пыль","Ремонт-РХБЗ","Сканер СПИН","СЛК","УССО Сервис","109-СКАНЕР-ДИРЕКТ Ф1","109-СКАНЕР-ДИРЕКТ Ф2","109-СКАНЕР-ТЕРРА","2136-УСТАНОВКА АМК-М-450","2136-УСТАНОВКА М-150","2136-УСТАНОВКА М-450","СЛМ ПО-2.0","Выращивание деталей","Держинец-1 РТИ","Разгон-ППС","Разгон-СДИ","Разгон-СН","Разгон-СО","Радиофотоника","Термоконтроль", "Прочее"];

const monthNames = {
    1: "Январь",
    2: "Февраль",
    3: "Март",
    4: "Апрель",
    5: "Май",
    6: "Июнь",
    7: "Июль",
    8: "Август",
    9: "Сентябрь",
    10: "Октябрь",
    11: "Ноябрь",
    12: "Декабрь"
  };


bot.start(async (ctx) => {
    const users = await allUsers();
    const userId = ctx.from.id;
    const chatId = ctx.chat.id
    if(users[userId]) {
        if(!users[userId].auth) {
            try {
                if (ctx.callbackQuery.message) {
                    await ctx.deleteMessage();
                }
            } catch (err) {
                console.log(`Ошибка удаления сообщения: ${err.message}`);
            }
            sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
        }
    }
    
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    bot.telegram.sendMessage(chatId, `Работа начата`)
    const check = setInputMode(ctx, 'check')
    if (check) return
    if (users.hasOwnProperty(userId)) {
        ctx.reply(`Вы уже есть в нашей системе.`, 
            Markup.inlineKeyboard([
                Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')
            ])
        );
        return;
    } else {
        ctx.reply(`Вы отсутствуете в нашей системе\nЖелаете зарегистрироваться?`, 
            Markup.inlineKeyboard([
                Markup.button.callback('Да', 'yesregister')
            ])
        );
        return;
    }
});
bot.action('editprofile', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const check = setInputMode(ctx, 'check')
    if(check) return
 // Удаляем предыдущее сообщение
    if(!users.hasOwnProperty(userId)) return
    ctx.reply(`Вы записаны как ${users[userId].name}`, Markup.inlineKeyboard([
        [
            Markup.button.callback('Изменить имя', 'changename'),
            Markup.button.callback('📈 Статистика', 'statMount'),
        ],
        [
            Markup.button.callback('⚠️ Оповещения', 'alarms'),
            
        ],
        [
            Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'),  
        ],
        
    ], 
    ));
});
bot.action('alarms', async (ctx) =>{
    let users = await allUsers();

    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    } // Удаляем предыдущее сообщение
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    if(!users[userId].hasOwnProperty('alarms')) {
        users[userId] = { alarms: false }
        const jsonData = JSON.stringify(users, null, 2);
        fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            } else {
                console.log('Данные успешно записаны в файл.');
            }
        });
    }
    let alMessage
    let keyboard = [ ]
    if(users[userId].alarms.valueA) {
        if(users[userId].alarms.valueB) {
            alMessage = `✅ Оповещения сейчас активны по утрам (10:00)`
        } else {
            alMessage = `✅ Оповещения сейчас активны по вечерам (17:15)`
        }
        
        keyboard.push([Markup.button.callback('🔴 Отключить оповещения', 'offalarm'),])
    } else {
        alMessage = `🔴 Оповещения сейчас не активны`
        keyboard.push([Markup.button.callback('✅ Включить оповещения', 'onPrealarm'),])
    }

    keyboard.push([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'),])
    ctx.reply(`Оповещения напоминают вам о том что нужно заполнить учёт рабочего времени.\n\n${alMessage}`, Markup.inlineKeyboard(keyboard))
    
})
bot.action('onPrealarm', async(ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    let users = await allUsers();
    const userId = ctx.from.id;

    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    let keyboard = [[ Markup.button.callback('☀️ По утрам (10:00)', 'onalarmm'),], [ Markup.button.callback('🌕 По вечерам (17:15)', 'onalarmn'),]]
    ctx.reply(`Выберите время:`, Markup.inlineKeyboard(keyboard))
})
bot.action('onalarmm', async(ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    let users = await allUsers();
    const userId = ctx.from.id;

    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    users[userId].alarms.valueA = true
    users[userId].alarms.valueB = true

    const jsonData = JSON.stringify(users, null, 2);
        fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            } else {
                console.log('Данные успешно записаны в файл.');
            }
        });
    ctx.reply(`Уведомления теперь активны`, Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'),]))
    
})
bot.action('onalarmn', async(ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    let users = await allUsers();
    const userId = ctx.from.id;

    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    users[userId].alarms.valueA = true
    users[userId].alarms.valueB = false

    const jsonData = JSON.stringify(users, null, 2);
        fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            } else {
                console.log('Данные успешно записаны в файл.');
            }
        });
    ctx.reply(`Уведомления теперь активны`, Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'),]))
    
})
bot.action('offalarm', async(ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    let users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    users[userId].alarms.valueA = false
    const jsonData = JSON.stringify(users, null, 2);
        fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
            if (err) {
                console.error('Ошибка записи файла:', err);
            } else {
                console.log('Данные успешно записаны в файл.');
            }
        });
    ctx.reply(`Уведомления больше не активны`, Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'),]))
    
})
bot.action('changename', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const chatId = ctx.chat.id
    sendMessageAboutDataOrName(ctx, chatId, `Введите имя фамилию согласно примеру:\nИванов Иван Иванович`)
    setInputMode(ctx, 'name')
})
bot.action('mymenu', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    userProjects[userId] = []
    namesProjChoise = []
     // Удаляем предыдущее сообщение
    isDateToRevind[userId] = false
    const check = setInputMode(ctx, 'check')
    if(check) return
    const chatId = ctx.chat.id
    sendMessageForStart(chatId)
    
});
bot.action(`mymenunodelete`, async(ctx) => {
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    userProjects[userId] = []
    namesProjChoise = []
     // Удаляем предыдущее сообщение
    isDateToRevind[userId] = false
    const check = setInputMode(ctx, 'check')
    if(check) return
    const chatId = ctx.chat.id
    sendMessageForStart(chatId)
})
bot.on("message", async (ctx) => {
    console.log(`сработал на сообщение`)
    const users = await allUsers()
    const userId = ctx.from.id;
    const check = setInputMode(ctx, 'formessage')
    if(!check) {
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
        return
    }
    const messageText = ctx.message.text;
    const words = messageText.trim().split(/\s+/);
    if (words.length === 3) {
        const name = formatName(ctx.message.text)
        writeDataName(userId, name);
        setInputMode(ctx, 'off')
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
        
        ctx.reply(`Запомнил вас как\n${name}`, 
            Markup.inlineKeyboard([
                Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')
            ])
        );
    } else if (isValidDate(messageText)) {
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
        if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
        if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
        setInputMode(ctx, 'off')
        const [day, month, year] = messageText.split('.').map(part => parseInt(part, 10));
        console.log(day,month,year)
        currentTime[userId] = { Y: year, M: month, D: day};
        if(await dataIsFull(ctx)) return ctx.reply('Вы уже заполнили форму за этот день', Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')]))
        const buttons = projectsNames.map((project, index) => [Markup.button.callback(`${index} - ${project}`, `project_${index}`)]);
        if(isDateToRevind[userId]){
            const userdata = await allUsers()
            const proj = userdata[userId].last
            const projectIndexes = proj.map(p => projects.indexOf(p));
            const extractedProjects = projectIndexes.map(index => projectsNames[index]);
            const exxxx = distributeHoursToCheck(projectsNames, extractedProjects)
            const selectedProjects = exxxx.map(proj => `☑️ ${proj}`).join('\n');  
            return ctx.reply(`Подтвердите отправку формы.\nФорма будет составлена следующим образом.\n\nДата: ${currentTime[userId].D}.${currentTime[userId].M}.${currentTime[userId].Y}\nПроекты: \n${selectedProjects}\n\nПользователь:\n${userdata[userId].name}`, Markup.inlineKeyboard([Markup.button.callback('☑️ Подтвердить', 'senddata'), Markup.button.callback('❌ Главное меню', 'mymenu')]));
        } 
        ctx.reply('Выберите проекты', Markup.inlineKeyboard(buttons));
    } else {
        const chatId = ctx.chat.id
        sendErrorMessage(ctx, chatId, 'Неверный формат Имени или Даты')
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
    }
});
bot.action('yesregister', async (ctx) => {
    const chatId = ctx.chat.id
    const userId = ctx.from.id;
    console.log(chatId)
    console.log(userId)
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    
    setInputMode(ctx, 'name')
    let idsData = await readDataFunc('./userids.json')
    idsData[userId] = chatId
    saveDataFunc('./userids.json', idsData)
    sendMessageAboutDataOrName(ctx, chatId, 'Введите имя фамилию согласно примеру.\nИванов Иван Иванович')
});
bot.action('yeschange', async (ctx) => {
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const chatId = ctx.chat.id
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    inputMode[ctx.from.id] = true;
    console.log(inputMode);
    sendMessageAboutDataOrName(ctx, chatId, 'Введите имя фамилию согласно примеру.\nИванов Иван Иванович')
});
bot.action('settime', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `Вы ещё не авторизованы. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const check = setInputMode(ctx, 'check')
    if(check) return
    
    

    const keyboard = [ 
        [
            Markup.button.callback('✳ Сегодня', 'today'),
            Markup.button.callback('📅 Выбрать вручную', 'writetime'),
            
        ],
        [
            Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')

        ],
    ];
    let tex = ''
    if (users[userId].last) {
        tex = `\n\nПри выборе "Как в прошлый раз" - Проекты будут выбраны так же как вы это сделали в прошлый раз.`
        keyboard.push([
            
            Markup.button.callback('🔁 Как в прошлый раз', 'revind')
        ]);
    }

    ctx.reply(`Выберите дату, за которую хотите заполнить. ${tex}`, Markup.inlineKeyboard(keyboard));
});
bot.action('today', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Месяцы начинаются с 0, поэтому добавляем 1
    const day = currentDate.getDate();
    currentTime[userId] = { Y: year, M: month, D: day}
    if(await dataIsFull(ctx)) return ctx.reply('Вы уже заполнили форму за этот день', Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')]))
    const buttons = projectsNames.map((project, index) => [Markup.button.callback(`${index} - ${project}`, `project_${index}`)]);
    ctx.reply('Выберите проекты', Markup.inlineKeyboard(buttons));
});
bot.action('writetime', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    
    const chatId = ctx.chat.id
    setInputMode(ctx, 'date')
    sendMessageAboutDataOrName(ctx, chatId, 'Пожалуйста, введите дату в формате "ДД.ММ.ГГГГ", например "01.01.2024".')
});
bot.action('revind', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const userId = ctx.from.id;
    const userdata = await allUsers()
    if(!userdata[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!userdata[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Месяцы начинаются с 0, поэтому добавляем 1
    const day = currentDate.getDate();
    const proj = userdata[userId].last
    const projectIndexes = proj.map(p => projects.indexOf(p));
    const extractedProjects = projectIndexes.map(index => projectsNames[index]);
    const exxxx = distributeHoursToCheck(projectsNames, extractedProjects)
    const selectedProjects = exxxx.map(proj => `☑️ ${proj}`).join('\n'); 
    currentTime[userId] = { Y: year, M: month, D: day}
    const keyboard = [
        Markup.button.callback('📝 Изменить дату', 'changedata'),
        Markup.button.callback('📤 Отправить', 'senddata'),
        Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')
    ]
    ctx.reply(`Подтвердите отправку формы.\nФорма будет составлена следующим образом.\n\nДата: ${day}.${month}.${year}\nПроекты: \n${selectedProjects}\n\nПользователь:\n${userdata[userId].name}`,Markup.inlineKeyboard(keyboard));
})
bot.action('changedata', async (ctx) => {
    const userId = ctx.from.id;
    const chatId = ctx.chat.id
    const users = await allUsers();
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    
        try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    setInputMode(ctx, 'date')
    isDateToRevind[userId] = true
    sendMessageAboutDataOrName(ctx, chatId, 'Пожалуйста, введите дату в формате "ДД.ММ.ГГГГ", например "01.01.2024".')

})
bot.action('senddata', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    if(await dataIsFull(ctx)) return ctx.reply('Вы уже заполнили форму за этот день', Markup.inlineKeyboard([Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')]))
    const chatId = ctx.chat.id
    isDateToRevind[userId] = false
    const userdata = await allUsers()
    userProjects[userId] = userdata[userId].last
    ctx.reply(`Форма успешно отправлена за ${currentTime[userId].D}.${currentTime[userId].M}.${currentTime[userId].Y}`)
    sendForm(userId, chatId)
})

projectsNames.forEach((project, index) => {
    bot.action(`project_${index}`, async (ctx) => {
        const users = await allUsers();
        const userId = ctx.from.id;
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
        if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
        if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
        
        console.log(project, index)
         // Удаляем предыдущее сообщение
        if (!userProjects[userId]) {
            userProjects[userId] = [];
        }
        const targetToDeleteFromUserProjects = projects[index]
        if(userProjects[userId].includes(targetToDeleteFromUserProjects)) {
            userProjects[userId] = userProjects[userId].filter(item => item !== targetToDeleteFromUserProjects);
        } else {
            userProjects[userId].push(projects[index]);
        }

        const targetToDeleteFromNamesProjChoise = projectsNames[index]
        console.log(targetToDeleteFromNamesProjChoise)
        if(!namesProjChoise[userId]) {
            namesProjChoise[userId] = []
        }
        if(namesProjChoise[userId].includes(targetToDeleteFromNamesProjChoise)) {
            namesProjChoise[userId] = namesProjChoise[userId].filter(item => item !== targetToDeleteFromNamesProjChoise);
        } else {
            namesProjChoise[userId].push(project)
        }
        const exxx = distributeHoursToCheck(projectsNames, namesProjChoise[userId])
        const selectedProjects = exxx.map(proj => `☑️ ${proj}`).join('\n'); 

        ctx.reply(`Вы выбрали проект: ${project}\nВсего вы выбрали:\n${selectedProjects}\n\nВсего вы выбрали ${userProjects[userId]}`, 
            Markup.inlineKeyboard([
                Markup.button.callback('Добавить еще проект', 'add_more_projects'),
                Markup.button.callback('Готово', 'done'),
                Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')
            ])
        );
    });
});
bot.action('add_more_projects', async (ctx) => {
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`) 
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
    const buttons = projectsNames.map((project, index) => [Markup.button.callback(`${index} - ${project}`, `project_${index}`)]);
    ctx.reply('Выберите проекты', Markup.inlineKeyboard(buttons));
});
bot.action('done', async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const chatId = ctx.chat.id
     // Удаляем предыдущее сообщение
    if (!userProjects[userId] || userProjects[userId].length === 0) {
        return ctx.reply('Вы не выбрали ни одного проекта.');
    }
    // Здесь вы можете вызвать функцию для отправки данных
    ctx.reply(`Форма успешно отправлена за ${currentTime[userId].D}.${currentTime[userId].M}.${currentTime[userId].Y}.`);
    sendForm(userId, chatId);
    
});
function getDayOfWeek(day, month) {
    // Создаем объект даты
    const date = new Date(2024, month - 1, day);
    
    // Массив с названиями дней недели
    const daysOfWeek = ["Воскресенье", "Понедельник 📌", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"];
    
    // Получаем день недели
    const dayOfWeek = date.getDay();
    
    // Возвращаем день и день недели
    return `${day} ${daysOfWeek[dayOfWeek]}`;
}
bot.action(/date_\d+/, async (ctx) => {
    try {
        if (ctx.callbackQuery.message) {
            await ctx.deleteMessage();
        }
    } catch (err) {
        console.log(`Ошибка удаления сообщения: ${err.message}`);
    }
    const users = await allUsers();
    const userId = ctx.from.id;
    if(!users[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!users[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
    const monthIndex = parseInt(ctx.match[0].split('_')[1]); // Получаем индекс месяца из обратного вызова
    const monthName = monthNames[monthIndex]; // Получаем название месяца из объекта monthNames
    console.log(`Пользователь выбрал месяц: ${monthName}, ${monthIndex}`);
    const userDataAll = await allUsers();
    const selectedProjects = userDataAll[userId].stat['2024'][monthIndex].map(proj => `☑️ ${getDayOfWeek(proj, monthIndex)}`).join('\n'); 
    const keyboard = [
        [
            Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu'), Markup.button.callback('⬇️ Не удалять и вернуться', 'mymenunodelete')
        ]
    ];
    ctx.sendMessage(`Статистика за ${monthName}\n\nДаты:\n${selectedProjects}`, Markup.inlineKeyboard(keyboard));
    // Далее вы можете использовать monthIndex для получения нужного месяца и выполнения действий с данными пользователя
});

bot.action('statMount', async (ctx) => {
    const userId = ctx.from.id;
    const userDataAll = await allUsers();

    if(!userDataAll[userId]) return sendErrorMessage(ctx, `Вы не авторизованны.`)
    if(!userDataAll[userId].auth) return sendErrorMessage(ctx, `На проверке. Ожидайте одобения администратора. Ускорить проверку можно написав сюда @bandomas`)
        try {
            if (ctx.callbackQuery.message) {
                await ctx.deleteMessage();
            }
        } catch (err) {
            console.log(`Ошибка удаления сообщения: ${err.message}`);
        }
    if(!userDataAll[userId].hasOwnProperty('stat')) return  sendErrorMessage(ctx, 'Вы ещё ни разу не заполняли форму.')
    const months = Object.keys(userDataAll[userId].stat['2024']);
    const monthNamesArray = months.map(month => monthNames[parseInt(month)]);
    const keyboard = [
        [
            Markup.button.callback('↩️ Вернуться в главное меню', 'mymenu')
        ]
    ];
    if (userDataAll[userId].stat) {
        monthNamesArray.forEach((name, id) => {
            keyboard.push([Markup.button.callback(`${name}`, `date_${months[id]}`)]);
            bot.action(`date_${months[id]}`, async (ctx, next) => {
                console.log(`Пользователь выбрал месяц: ${name}`);
                // Далее вы можете использовать months[id] для получения нужного месяца и выполнения действий с данными пользователя
                return next();
            }, async (ctx) => {});
        });
    }
    ctx.sendMessage(`Выберите месяц`, Markup.inlineKeyboard(keyboard));
});



bot.launch();


async function allUsers() {
    return new Promise((resolve, reject) => {
        fs.readFile('users.json', 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const users = JSON.parse(data);
                resolve(users);
            } catch (error) {
                reject(error);
            }
        });
    });
}
async function readDataFunc(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            try {
                const users = JSON.parse(data);
                resolve(users);
            } catch (error) {
                reject(error);
            }
        });
    });
}
async function saveDataFunc(filename, data) {
    const jsonData = JSON.stringify(data, null, 2);
    fs.writeFile(filename, jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
        } else {
            console.log('Данные успешно записаны в файл.');
        }
    });

}










/*function sendForm(year, month, day, userName) {
    const GoogleURL = 'https://docs.google.com/forms/d/e/1FAIpQLSdikzcL-InKRw_lbmpTysxtwQx0Wb7l8F2fROJkJiaNyCNp7A/formResponse';
    const urlReferer = 'https://docs.google.com/forms/d/e/1FAIpQLSdikzcL-InKRw_lbmpTysxtwQx0Wb7l8F2fROJkJiaNyCNp7A/viewform';
    let formData = new FormData();
    formData.append('entry.210931804_year', `${year}`);
    formData.append('entry.210931804_month', `${month}`);
    formData.append('entry.210931804_day', `${day}`);
    formData.append('entry.1970048429', `${userName}`); // Имя
    formData.append('entry.1036971134', `Нет`);
    formData.append('entry.744013520', ``); // Город командировки
    formData.append('entry.460071324', ``); // Отпуск больничный
    distributeHours(projects, userProjects[userId]);
    formData.append('entry.172335038', ``); // комментарий

    fetch(GoogleURL, {
        method: 'POST',
        headers: {
            'Referer': urlReferer
        },
        body: formData
    }).then(response => {
        console.log('Данные успешно отправлены:', response);
    }).catch(error => {
        console.error('Ошибка при отправке данных:', error);
    });
}
*/
const distributeHours = async (projects, pon, totalHours = 8, formData) => {
    let projectsCount = pon.length;
    let hoursPerProject = [];
    let remainingHours = totalHours;
    let forReturn = []
    for (let i = 0; i < projectsCount; i++) {
        let hours = Math.floor(remainingHours / (projectsCount - i) * 2) / 2; // округляем до ближайшего 0.5
        hoursPerProject.push(hours);
        remainingHours -= hours;
    }

    let hoursMap = {};
    pon.forEach((projectId, index) => {
        hoursMap[projectId] = hoursPerProject[index];
    });

    projects.forEach((projectId) => {
        if (hoursMap[projectId] !== undefined) {
            let hoursString = hoursMap[projectId].toString().replace('.', ',');
            //formData.append(`entry.${projectId}`, `${hoursString}`);
            forReturn.push(`${projectId}-${hoursString}`)
            console.log(`entry.${projectId}, ${hoursString}`);
        } else {
            //formData.append(`entry.${projectId}`, ``);
            forReturn.push(`${projectId}-`)
            console.log(`entry.${projectId}`);
        }
    });
    return forReturn
};

const distributeHoursToCheck = (projects, pon, totalHours = 8) => { //(все проекты, выбранные проекты)
    let projectsCount = pon.length;
    let hoursPerProject = [];
    let remainingHours = totalHours;
    let toReturn = []

    for (let i = 0; i < projectsCount; i++) {
        let hours = Math.floor(remainingHours / (projectsCount - i) * 2) / 2; // округляем до ближайшего 0.5
        hoursPerProject.push(hours);
        remainingHours -= hours;
    }

    let hoursMap = {};
    pon.forEach((projectId, index) => {
        hoursMap[projectId] = hoursPerProject[index];
    });

    projects.forEach((projectId) => {
        if (hoursMap[projectId] !== undefined) {
            toReturn.push(`${projectId} ${hoursMap[projectId]} ч.`)
        }
    });
    return toReturn

};
const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/
function isValidDate(text) {
    return dateRegex.test(text);
}


/*
bot.telegram.sendMessage('586416050', 'lol', Markup.inlineKeyboard([
    Markup.button.callback('Да', 'yesregister'),
    Markup.button.callback('Нет', 'noregister')
]))
*/
function sendMessageForStart(id) {

    const keyboard = [
        [
            Markup.button.callback('📝 Отметиться', 'settime'),
            Markup.button.callback('🧍 Профиль', 'editprofile')
        ]
    ]
    bot.telegram.sendMessage(id, 'Выберите действие:', Markup.inlineKeyboard(keyboard))
}
sendMessageForStart('586416050')

const formatName = (name) => {
    return name.toLowerCase().replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());
};

function setInputMode(ctx, type) {
    const chatId = ctx.chat.id 
    const userId = ctx.from.id;
    if (!inputMode[userId]) {
        inputMode[userId] = {};
    }
    if (inputMode[userId].inputName) {
        console.log(`На данный момент пользователь в режиме ввода сообщений. [ ${inputMode[userId].inputName} ]`)
        if(type === 'formessage') return true
        if(type === 'off') return inputMode[userId].inputName = false
        sendMessageAboutDataOrName(ctx, chatId, `Введите имя фамилию согласно примеру:\nИванов Иван Иванович`)
        return true;
    }

    if (inputMode[userId].inputDate) {
        console.log(`На данный момент пользователь в режиме ввода даты. [ ${inputMode[userId].inputDate} ]`)
        if(type === 'formessage') return true
        if(type === 'off') return inputMode[userId].inputDate = false
        sendMessageAboutDataOrName(ctx, chatId, `Заполните дату\n\nПример:\n01.01.2024`)
        return true;
    }
    // Проверка и установка inputName и inputDate
    if (!inputMode[userId].hasOwnProperty('inputName')) {
        inputMode[userId].inputName = false;
    } 
    if (!inputMode[userId].hasOwnProperty('inputDate')) {
        inputMode[userId].inputDate = false;
    }
    inputMode[userId].inputName = false;
    inputMode[userId].inputDate = false;

    // Установка значений в зависимости от типа
    switch (type) {
        case 'name':
            inputMode[userId].inputName = true;
            break;
        case 'date':
            inputMode[userId].inputDate = true;
            break;
        case 'off':
            break;
        case 'check':
            return false 
        default:
            console.log('ok');
    }
}

function sendErrorMessage(ctx, message) {
    const chatId = ctx.chat.id
    const sentMessagePromise = ctx.reply(`Ошибка:\n\n${message}`);

    // Устанавливаем задержку перед удалением сообщения
    setTimeout(async () => {
        try {
            const sentMessage = await sentMessagePromise;
            // Удаляем сообщение
            await ctx.telegram.deleteMessage(chatId, sentMessage.message_id);
        } catch (error) {
            console.error("Ошибка при удалении сообщения:", error);
        }
    }, 5000)
}
function sendMessageAboutDataOrName(ctx, chatId, message) {
    const sentMessagePromise = ctx.reply(`${message}`);
    setTimeout(async () => {
        try {
            const sentMessage = await sentMessagePromise;
            // Удаляем сообщение
            await ctx.telegram.deleteMessage(chatId, sentMessage.message_id);
        } catch (error) {
            console.error("Ошибка при удалении сообщения:", error);
        }
    }, 15000)
}

async function saveData(userId, data) {
    const userDataAll = await allUsers();
    const lol = forStates.saveData(userDataAll[userId], currentTime[userId].D, currentTime[userId].M, currentTime[userId].Y)
    if (userDataAll[userId]) {
        userDataAll[userId] = lol
    } else {
        // Если пользователь не существует, создаем новый объект данных
        userDataAll[userId] = lol;
    }
    const jsonData = JSON.stringify(userDataAll, null, 2);
    fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
        } else {
            console.log('Данные успешно записаны в файл.');
        }
    });
}
const pon1 = {
    '12312': {
        'stat': {
            '': ['12.04.2024']
        }
    }
}
console.log(pon1[12312].stat)
async function writeDataChatIds() {
    
}
async function writeDataName(user, data) {
    const userDataAll = await allUsers();

    if (userDataAll[user]) {
        userDataAll[user].name = data;
        userDataAll[user].auth = false
        

    } else {
        // Если пользователь не существует, создаем новый объект данных
        userDataAll[user] = { name: data, auth: false, alarms: { valueA: false, valueB: false} };
    }
    const jsonData = JSON.stringify(userDataAll, null, 2);
    fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
        } else {
            console.log('Данные успешно записаны в файл.');
        }
    });
}

async function writeDataLast(user, data) {
    const userDataAll = await allUsers();

    if (userDataAll[user]) {
        userDataAll[user].last = data;
    } else {
        // Если пользователь не существует, создаем новый объект данных
        userDataAll[user] = { name: data };
    }
    
    const jsonData = JSON.stringify(userDataAll, null, 2);
    fs.writeFile('./users.json', jsonData, 'utf8', (err) => {
        if (err) {
            console.error('Ошибка записи файла:', err);
        } else {
            console.log('Данные успешно записаны в файл.');
        }
    });
}

async function sendForm(userId, chatId) {

    /////////
    const userName = await allUsers()

    const GoogleURL = 'https://docs.google.com/forms/d/e/1FAIpQLSfSPUBT1aRn8tOCIfUibKu3efrWj5YgZcwF5zzCVM_YCL2Dag/formResponse';
    const urlReferer = 'https://docs.google.com/forms/d/e/1FAIpQLSfSPUBT1aRn8tOCIfUibKu3efrWj5YgZcwF5zzCVM_YCL2Dag/viewform';
    let formData = new FormData();
    formData.append('entry.210931804_year', `${currentTime[userId].Y}`);
    formData.append('entry.210931804_month', `${currentTime[userId].M}`);
    formData.append('entry.210931804_day', `${currentTime[userId].D}`);
    formData.append('entry.1970048429', `${userName[userId].name}`); //ФИО
    formData.append('entry.1036971134', `Нет`); //Вы находились в командировке?
    formData.append('entry.172656762', ``); // Город командировки
    //formData.append('entry.744013520', ``); // Отпуск больничный
    const formatHour = await distributeHours(projects, userProjects[userId], undefined, formData);
    formatHour.forEach(function(element) {
        const [firstPart, secondPart] = splitString(element);
        formData.append(`${firstPart}`, `${secondPart}`);
    });
    formData.append('entry.172335038', ``); // комментарий
    
    console.log(formData)
    fetch(GoogleURL, {
        method: 'POST',
        headers: {
            'Referer': urlReferer
        },
        body: formData
    }).then(response => {
        console.log('Код статуса:', response.status);
        if(response.status == 200) {
            bot.telegram.sendMessage(chatId, `Данные успешно пришли на сервер.`)
        } else {
            bot.telegram.sendMessage(chatId, `ОШИБКА! ${response.status}\n\nЗаполните форму самостоятельно через сайт\n\nhttps://docs.google.com/forms/d/e/1FAIpQLSfSPUBT1aRn8tOCIfUibKu3efrWj5YgZcwF5zzCVM_YCL2Dag/viewform`)
        }
        
        console.log('Данные успешно отправлены: response');
    }).catch(error => {
        console.error('Ошибка при отправке данных:', error);
    });
    await writeDataLast(userId, userProjects[userId])
    const forSaveData = { [currentTime[userId].Y]: {
            [currentTime[userId].M]: [ currentTime[userId].D ]
        } 
    }
    await saveData(userId, forSaveData)
    const time = getFormatedTime()

    writeToCSV({
        Time: time,
        Projectid: userProjects[userId],
        Projectname: ``,
        date: `${currentTime[userId].D}.${currentTime[userId].M}.${currentTime[userId].Y}`,

    });
    userProjects[userId] = []
    namesProjChoise[userId] = []
    sendMessageForStart(chatId)

    
}
function splitString(inputString) {
    // Разделяем строку по дефису
    let words = inputString.split('-');

    // Проверяем результат и возвращаем массив из двух частей
    if (words.length >= 2) {
        return words;
    } else {
        return [inputString, ''];
    }
}


async function dataIsFull(ctx) {
    const userDataAll = await allUsers();
    const userId = ctx.from.id;
    currentTime[userId]
    if(!userDataAll[userId].stat) return false
    if(!userDataAll[userId].stat[currentTime[userId].Y]) return false
    if(!userDataAll[userId].stat[currentTime[userId].Y][currentTime[userId].M]) return false
    if(userDataAll[userId].stat[currentTime[userId].Y][currentTime[userId].M].includes(currentTime[userId].D)){
        return true
    } else {
        return false
    }

}

const getFormatedTime = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
    const day = ("0" + currentDate.getDate()).slice(-2);
    const hours = ("0" + currentDate.getHours()).slice(-2);
    const minutes = ("0" + currentDate.getMinutes()).slice(-2);
    const seconds = ("0" + currentDate.getSeconds()).slice(-2);

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};






async function getAllUsersWithAlarms() {
    const allUsersData = await allUsers();

    // Фильтрация пользователей, у которых alarms.valueA = true, и извлечение их ID
    const usersWithAlarms = Object.keys(allUsersData).filter(userId => allUsersData[userId].alarms.valueA === true);

    return usersWithAlarms;
}


async function checkTime() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();

    if (hours === 10 && minutes === 0) {
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Месяцы начинаются с 0, поэтому добавляем 1
        const day = now.getDate();
        const userDataAll = await allUsers();
        const UsersIds = await getAllUsersWithAlarms()
        UsersIds.forEach((element) => {
            if(!userDataAll[element].hasOwnProperty(`stat`)) return bot.telegram.sendMessage(element, `Вы сегодня не заполняли учёт рабочего времени, не забудьте заполнить!!`)
            if(userDataAll[element].stat[year][month].includes(day)) return
            if(userDataAll[element].alarms.valueB === true) return bot.telegram.sendMessage(element, `Вы сегодня не заполняли учёт рабочего времени, не забудьте заполнить!`)
        })
        console.log('It is 10:00 AM');
    } else if (hours === 17 && minutes === 15) {
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // Месяцы начинаются с 0, поэтому добавляем 1
        const day = now.getDate();
        const userDataAll = await allUsers();
        const UsersIds = await getAllUsersWithAlarms()
        UsersIds.forEach((element) => {
            if(!userDataAll[element].hasOwnProperty(`stat`)) return bot.telegram.sendMessage(element, `Вы сегодня не заполняли учёт рабочего времени, не забудьте заполнить!!!`)
            if(userDataAll[element].stat[year][month].includes(day)) return
            if(userDataAll[element].alarms.valueB === false) return bot.telegram.sendMessage(element, `Вы сегодня не заполняли учёт рабочего времени, не забудьте заполнить! !`)
        })
        console.log('It is 17:01 PM');
    }
}

// Проверяем время каждую минуту
setInterval(checkTime, 60 * 1000);

// Для проверки текущего времени сразу после запуска скрипта
checkTime();
