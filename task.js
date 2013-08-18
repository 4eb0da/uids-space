(function(){
    "use strict";

    /**
     * Небольшие пояснения ко всему.
     * Стиль кода немного поменял под свой. В задании не было сказано, что нужно использовать какой-то определённый ;-)
     * Поправил jsdoc-комментарии. Возможно, записи вида {Number}[] поддерживаются вашим модифицированным JsDoc'ом,
     * но стандартный не работает (?) с ними. WebStorm также не понимает их, что мешает корректно определять типы
     * аргументов.
     * Считаю, что если корабль и планета имеют одинаковые координаты, то корабль на планете и можно менять его груз.
     * Так как координаты - числа, то под одинаковыми координатами понимаю числа, отличающиеся не больше, чем на EPS.
     * Похоже, что подразумевалось, будто написаный код будет кидать исключения в разных ситуациях (когда, например,
     * корабль не на нужной планете). Так я и написал. Хотя обычно предпочитаю использовать исключения крайне редко.
     * Также я думаю, что методам передают корректные данные. Можно было бы сделать проверки в каждом методе, но как
     * минимум тип аргументов у всех функций прописан, IDE может выдавать предостережения на этот счёт. Не думаю, что
     * вы хотели увидеть проверки на всё во всех методах. Да и от всего не защититься - в любом другом месте могли
     * подменить .hasOwnProperty на объекте, например. Извините, что большой комментарий.
     */

    var VESSEL_REPORT_STRING = 'Корабль "%name%". Местоположение: %position%. Занято: %cargo% из %capacity%т.';
    var PLANET_REPORT_STRING = 'Планета "%name%". Местоположение: %position%. Доступно груза: %cargo%т.';
    var EPS = 1e-9;

    /**
     * Выводит указанное сообщение в консоль. В задании не было сказано, куда именно выводить, поэтому сделал отдельный
     * метод для возможности быстрой замены вывода. И вообще это, наверно, правильно было вынести в отдельныую функцию.
     * @param {String} message Сообщение, которое нужно вывести.
     */
    function print(message){
        console.log(message);
    }

    /**
     * Возвращает строку с подставленными параметрами.
     * @param {String} message Исходная строка. Может содержать последовательности символов вида '%name', которые будут
     * заменены на соответствующие данные из data.
     * @param {Object} data Простой объект, содержащий строки
     * @example
     * formatMessage('Planet "%name%"', {name: 'Earth'}); // Planet "Earth"
     * @returns {String}
     */
    function formatMessage(message, data){
        var res = message;
        for(var name in data){
            if( data.hasOwnProperty(name) ){
                res = res.replace('%' + name + '%', data[name]);
            }
        }
        return res;
    }

    /**
     * Создает экземпляр космического корабля.
     * @name Vessel
     * @param {String} name Название корабля.
     * @param {Array|Planet} position Местоположение корабля.
     * @param {Number} capacity Грузоподъемность корабля.
     */
    function Vessel(name, position, capacity){
        this.name = name;
        this.position = position;
        this.capacity = capacity;
        this.cargo = 0;
    }

    /**
     * Отдаёт строку, содержащую координаты в виде "x,y".
     * @returns {String}
     * @protected
     * @name Vessel.getPositionString
     */
    Vessel.prototype.getPositionString = function(){
        var coordinates;
        if( this.position instanceof Planet ){
            coordinates = this.position.coordinates;
        }
        else{
            coordinates = this.position;
        }
        return coordinates.join(',');
    };

    /**
     * Выводит текущее состояние корабля: имя, местоположение, доступную грузоподъемность.
     * Есть некоторое несоответствие между данными примерами и тем, что написано в описании задания. Я решил следовать
     * описанию.
     * @example
     * vessel.report(); // Грузовой корабль. Местоположение: Земля. Товаров нет.
     * @example
     * vessel.report(); // Грузовой корабль. Местоположение: 50,20. Груз: 200т.
     * @name Vessel.report
     */
    Vessel.prototype.report = function(){
        var position = this.getPositionString();
        print(formatMessage(VESSEL_REPORT_STRING, {
            name: this.name,
            position: position,
            cargo: this.cargo,
            capacity: this.capacity
        }));
    };

    /**
     * Выводит количество свободного места на корабле.
     * @name Vessel.getFreeSpace
     * @returns {Number}
     */
    Vessel.prototype.getFreeSpace = function(){
        return this.capacity - this.cargo;
    };

    /**
     * Выводит количество занятого места на корабле.
     * @name Vessel.getOccupiedSpace
     */
    Vessel.prototype.getOccupiedSpace = function(){
        return this.cargo;
    };

    /**
     * Добавляет груз на корабль.
     * @param {Number} weight Вес нового груза.
     * @throws {Error}
     * @name Vessel.addCargo
     */
    Vessel.prototype.addCargo = function(weight){
        if( weight > this.getFreeSpace() ){
            throw new Error('Not enough free space in ship');
        }
        this.cargo += weight;
    };

    /**
     * Снимает груз с корабля.
     * @param {Number} weight Вес груза.
     * @throws {Error}
     * @name Vessel.removeCargo
     */
    Vessel.prototype.removeCargo = function(weight){
        if( weight > this.getOccupiedSpace() ){
            throw new Error('Not enough cargo in ship');
        }
        this.cargo -= weight;
    };

    /**
     * Переносит корабль в указанную точку.
     * @param {Array|Planet} newPosition Новое местоположение корабля. Или массив из двух числовых координат, или Planet.
     * @example
     * vessel.flyTo([1,1]);
     * @example
     * var earth = new Planet('Земля', [1,1]);
     * vessel.flyTo(earth);
     * @name Vessel.flyTo
     */
    Vessel.prototype.flyTo = function(newPosition){
        this.position = newPosition;
    };

    /**
     * Возвращает массив с координатами корабля. Если корабль на планете, возвращает координаты планеты.
     * @returns {Array}
     * @name Vessel.getCoordinates
     */
    Vessel.prototype.getCoordinates = function(){
        if( this.position instanceof Planet ){
            return this.position.coordinates;
        }
        return this.position;
    };

    /**
     * Создает экземпляр планеты.
     * @name Planet
     * @param {String} name Название Планеты.
     * @param {Array} position Местоположение планеты.
     * @param {Number} availableAmountOfCargo Доступное количество груза.
     */
    function Planet(name, position, availableAmountOfCargo){
        this.name = name;
        this.coordinates = position;
        this.availableAmountOfCargo = availableAmountOfCargo;
    }

    /**
     * Выводит текущее состояние планеты: имя, местоположение, количество доступного груза.
     * @name Planet.report
     */
    Planet.prototype.report = function(){
        print(formatMessage(PLANET_REPORT_STRING, {
            name: this.name,
            position: this.coordinates.join(','),
            cargo: this.availableAmountOfCargo
        }));
    };

    /**
     * Возвращает доступное количество груза планеты.
     * @returns {Number}
     * @name Vessel.getAvailableAmountOfCargo
     */
    Planet.prototype.getAvailableAmountOfCargo = function(){
        return this.availableAmountOfCargo;
    };

    /**
     * Проверяет, что указанный корабль находится на этой планете. Кидает исключение, если это не так.
     * @param {Vessel} vessel Корабль.
     * @name Planet.checkVesselAvailability
     */
    Planet.prototype.checkVesselAvailability = function(vessel){
        var coordinates = vessel.getCoordinates();
        if( Math.abs(coordinates[0] - this.coordinates[0]) > EPS ||
            Math.abs(coordinates[1] - this.coordinates[1]) > EPS ){
            throw new Error('The vessel is not on this planet');
        }
    };

    /**
     * Загружает на корабль заданное количество груза.
     *
     * Перед загрузкой корабль должен приземлиться на планету.
     * @param {Vessel} vessel Загружаемый корабль.
     * @param {Number} cargoWeight Вес загружаемого груза.
     * @throws {Error}
     * @name Vessel.loadCargoTo
     */
    Planet.prototype.loadCargoTo = function(vessel, cargoWeight){
        if( this.getAvailableAmountOfCargo() < cargoWeight ){
            throw new Error('Not enough cargo on planet');
        }
        this.checkVesselAvailability(vessel);
        vessel.addCargo(cargoWeight);
        this.availableAmountOfCargo -= cargoWeight;
    };

    /**
     * Выгружает с корабля заданное количество груза.
     *
     * Перед выгрузкой корабль должен приземлиться на планету.
     * @param {Vessel} vessel Разгружаемый корабль.
     * @param {Number} cargoWeight Вес выгружаемого груза.
     * @name Vessel.unloadCargoFrom
     */
    Planet.prototype.unloadCargoFrom = function(vessel, cargoWeight){
        this.checkVesselAvailability(vessel);
        vessel.removeCargo(cargoWeight);
        this.availableAmountOfCargo += cargoWeight;
    };

    var vessel = new Vessel('Яндекс', [0,0], 1000);
    var planetA = new Planet('A', [0,0], 0);
    var planetB = new Planet('B', [100, 100], 5000);

    // Проверка текущего состояния
    vessel.report(); // Корабль "Яндекс". Местоположение: 0,0. Занято: 0 из 1000т.
    planetA.report(); // Планета "A". Местоположене: 0,0. Грузов нет.
    planetB.report(); // Планета "B". Местоположене: 100,100. Доступно груза: 5000т.

    vessel.flyTo(planetB);
    planetB.loadCargoTo(vessel, 1000);
    vessel.report(); // Корабль "Яндекс". Местоположение: 100,100. Занято: 1000 из 1000т.

    vessel.flyTo(planetA);
    planetA.unloadCargoFrom(vessel, 500);
    vessel.report(); // Корабль "Яндекс". Местоположение: 0,0. Занято: 500 из 1000т.
    planetA.report(); // Планета "A". Местоположение: 0,0. Доступно груза: 500т.
    planetB.report(); // Планета "B". Местоположение: 100,100. Доступно груза: 4000т.
})();