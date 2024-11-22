function saveData(data, day, month, year) {
    // Сохраняем исходные данные
    const originalData = { ...data };

    // Проверяем, существует ли уже объект для указанного года и месяца
    //console.log(`Получил ${JSON.stringify(data)}`);
    if (!data || !data.stat) {
        // Если нет, создаем новый объект для этого года и месяца
        data = { stat: {} };
    }

    // Сохраняем остальные поля, если они были в исходных данных
    const { name, last, auth, alarms } = originalData;
    
    if (!data.stat[year]) {
        data.stat[year] = {};
    }
    
    if (!data.stat[year][month]) {
        data.stat[year][month] = [];
    }
    
    // Если день уже не добавлен, добавляем его
    if (!data.stat[year][month].includes(day)) {
        data.stat[year][month].push(day);
        
        // Сортируем массив чисел
        data.stat[year][month].sort((a, b) => a - b);
    }

    // Восстанавливаем остальные поля в измененных данных
    if (name) {
        data.name = name;
    }

    if (last) {
        data.last = last;
    }

    if(auth) {
        data.auth = auth;
    }

    if(alarms) {
        data.alarms = alarms
    }
    
    // Возвращаем измененные данные
    //console.log(`Вернул ${JSON.stringify(data)}`);
    return data;
}




function getAbout(year, month, data) {
    // Массив с названиями месяцев
    const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  
    // Проверка наличия месяца в диапазоне от 1 до 12
    if (month < 1 || month > 12) {
      return 'Ошибка: месяц должен быть в диапазоне от 1 до 12';
    }
  
    // Создание нового массива с датами
    const about = [];
    
    // Проверка наличия данных для указанного года и месяца
    if (data.stat && data.stat[year] && data.stat[year][month]) {
      // Проходим по всем дням в массиве данных
      data.stat[year][month].forEach(day => {
        // Добавляем дату в формате "день месяц" в массив
        about.push(`${day} ${months[month - 1]}`);
      });
    }
  
    return about;
  }

module.exports = {
    saveData,
    getAbout
}