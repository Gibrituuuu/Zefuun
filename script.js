// Добавляем в самое начало файла
let customDate = null;

// В начале файла добавим переменную для отслеживания состояния производительности
let highPerformanceMode = localStorage.getItem('highPerformanceMode') === 'true'; // Восстанавливаем состояние из localStorage

function getCurrentDate() {
    return customDate || new Date();
}

// Функция для создания случайных звезд
function createStars(container, count, className, size, delay) {
    const fragment = document.createDocumentFragment();
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.classList.add(className);
        star.style.cssText = `
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            width: ${size}px;
            height: ${size}px;
            animation-delay: ${Math.random() * delay}s;
            opacity: 0;
        `;
        fragment.appendChild(star);
    }
    
    container.appendChild(fragment);
    
    // Используем IntersectionObserver для анимации только видимых звезд
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
            }
        });
    });
    
    container.querySelectorAll('.' + className).forEach(star => {
        observer.observe(star);
    });
}

// Создаём звёзды
const starsContainer = document.getElementById('stars');
createStars(starsContainer, 300, 'star', 2, 2);

// Анимация сердечка
let c = document.getElementById('heart-canvas'),
    $ = c.getContext('2d'),
    w = c.width = innerWidth,
    h = c.height = innerHeight,
    random = Math.random;

$.fillStyle = 'black';
$.fillRect(0, 0, w, h);

let heartPos = function (rad) {
    return [Math.pow(Math.sin(rad), 3), -(15 * Math.cos(rad) - 5 * Math.cos(2 * rad) - 2 * Math.cos(3 * rad) - Math.cos(4 * rad))];
};

let scaleAndTranslate = function (pos, sx, sy, dx, dy) {
    return [dx + pos[0] * sx, dy + pos[1] * sy];
};

window.addEventListener('resize', function () {
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    $.fillStyle = 'black';
    $.fillRect(0, 0, w, h);
});

let traceCount = 50,
    pointsOrigin = [],
    dr = 0.1,
    i;

for (i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPos(i), 210, 13, 0, 0));
}

for (i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPos(i), 150, 9, 0, 0));
}

for (i = 0; i < Math.PI * 2; i += dr) {
    pointsOrigin.push(scaleAndTranslate(heartPos(i), 90, 5, 0, 0));
}

let heartPointsCount = pointsOrigin.length,
    targetPoints = [];

let pulse = function (kx, ky) {
    for (i = 0; i < pointsOrigin.length; i++) {
        targetPoints[i] = [];
        targetPoints[i][0] = kx * pointsOrigin[i][0] + w / 2;
        targetPoints[i][1] = ky * pointsOrigin[i][1] + h / 2;
    }
};

let e = [];
for (i = 0; i < heartPointsCount; i++) {
    let x = random() * w;
    let y = random() * h;
    
    e[i] = {
        vx: 0,
        vy: 0,
        R: 2,
        speed: random() + 5,
        q: ~~(random() * heartPointsCount),
        D: 2 * (i % 2) - 1,
        force: 0.2 * random() + 0.7,
        f: 'hsla(0,' + ~~(40 * random() + 60) + '%,' + ~~(60 * random() + 20) + '%,.3)',
        trace: []
    };
    
    for (let k = 0; k < traceCount; k++) {
        e[i].trace[k] = { x: x, y: y };
    }
}

let config = {
    traceK: 0.4,
    timeDelta: 0.01
};

let time = 0;
let animationFrameId;
let isPageVisible = true;

document.addEventListener('visibilitychange', () => {
    isPageVisible = document.visibilityState === 'visible';
    if (isPageVisible) {
        loop();
    } else {
        cancelAnimationFrame(animationFrameId);
    }
});

function loop() {
    if (!isPageVisible) return;
    
    let n = -Math.cos(time);
    pulse((1 + n) * 0.5, (1 + n) * 0.5);
    
    time += ((Math.sin(time)) < 0 ? 9 : (n > 0.8) ? 0.2 : 1) * config.timeDelta;
    
    // Используем более эффективный способ очистки
    $.globalAlpha = 0.1;
    $.fillStyle = 'black';
    $.fillRect(0, 0, w, h);
    $.globalAlpha = 1;
    
    // Оптимизируем рендеринг частиц
    for (let i = 0; i < e.length; i++) {
        let u = e[i];
        if (!isParticleVisible(u)) continue; // Пропускаем невидимые частицы
        
        let q = targetPoints[u.q],
            dx = u.trace[0].x - q[0],
            dy = u.trace[1].y - q[1],
            length = Math.sqrt(dx * dx + dy * dy);
        
        if (10 > length) {
            if (0.95 < random()) {
                u.q = ~~(random() * heartPointsCount);
            } else {
                if (0.99 < random()) {
                    u.D *= -1;
                }
                
                u.q += u.D;
                u.q %= heartPointsCount;
                
                if (0 > u.q) {
                    u.q += heartPointsCount;
                }
            }
        }
        
        u.vx += (-dx / length) * u.speed;
        u.vy += (-dy / length) * u.speed;
        
        u.trace[0].x += u.vx;
        u.trace[0].y += u.vy;
        
        u.vx *= u.force;
        u.vy *= u.force;
        
        for (let k = 0; k < u.trace.length - 1;) {
            let T = u.trace[k];
            let N = u.trace[++k];
            N.x -= config.traceK * (N.x - T.x);
            N.y -= config.traceK * (N.y - T.y);
        }

        $.fillStyle = u.f;
        for (let k = 0; k < u.trace.length; k++) {
            $.fillRect(u.trace[k].x, u.trace[k].y, 1, 1);
        }
    }
    
    animationFrameId = requestAnimationFrame(loop);
}

// Функция проверки видимости частицы
function isParticleVisible(particle) {
    return particle.trace[0].x >= 0 && 
           particle.trace[0].x <= w && 
           particle.trace[0].y >= 0 && 
           particle.trace[0].y <= h;
}

loop();

// Логика проверки даты
const today = getCurrentDate();
const march8 = new Date(today.getFullYear(), 2, 8); // 8 марта
const march9 = new Date(today.getFullYear(), 2, 9); // 9 марта
const march10 = new Date(today.getFullYear(), 2, 10); // 10 марта

const congratsMessage = document.getElementById('congrats-message');
const additionalMessage = document.getElementById('additional-message');

// Функция для вычисления разницы в днях
function getDaysDifference(date1, date2) {
    const timeDiff = date2 - date1;
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
}

// Функция для правильного склонения слова "дней"
function getDaysWord(days) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
        return 'дней';
    }

    switch (lastDigit) {
        case 1:
            return 'день';
        case 2:
        case 3:
        case 4:
            return 'дня';
        default:
            return 'дней';
    }
}

// Функция проверки даты для конфетти
function isMarch10() {
    const today = getCurrentDate();
    const march10 = new Date(today.getFullYear(), 2, 10); // 10 марта
    return today.getDate() === march10.getDate() && today.getMonth() === march10.getMonth();
}

// Функция обновления всего контента на странице
function updateContent() {
    const today = getCurrentDate();
    const march8 = new Date(today.getFullYear(), 2, 8);
    const march9 = new Date(today.getFullYear(), 2, 9);
    const march10 = new Date(today.getFullYear(), 2, 10);

    if (today >= march10) {
        // День рождения - показываем только основное поздравление
        congratsMessage.textContent = "С Днём Рождения! 🎉";
        createConfetti(); // Добавляем конфетти
    } else {
        if (today < march8) {
            const daysToMarch8 = getDaysDifference(today, march8);
            const daysWord = getDaysWord(daysToMarch8);
            congratsMessage.textContent = `До 8 Марта осталось ${daysToMarch8} ${daysWord}!`;
        } else if (today >= march8 && today < march9) {
            congratsMessage.textContent = "С 8 Марта, дорогая! 💐";
        } else {
            congratsMessage.textContent = "8 марта уже было!";
        }
    }
}

// Восстанавливаем кастомную дату при загрузке страницы
const savedDate = localStorage.getItem('customDate');
if (savedDate) {
    customDate = new Date(savedDate);
}

// В начале файла после объявления customDate добавим функцию обновления индикатора
function updateDateIndicator() {
    const indicator = document.getElementById('date-indicator');
    if (customDate) {
        indicator.classList.remove('system');
        indicator.classList.add('custom');
    } else {
        indicator.classList.remove('custom');
        indicator.classList.add('system');
    }
}

// В обработчике DOMContentLoaded добавим вызов функции
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
    updateDateIndicator(); // Добавляем эту строку
    document.getElementById('performance-toggle').checked = highPerformanceMode; // Устанавливаем состояние тумблера

    document.getElementById('performance-toggle').addEventListener('change', (event) => {
        highPerformanceMode = event.target.checked;
        localStorage.setItem('highPerformanceMode', highPerformanceMode); // Сохраняем состояние в localStorage
        toggleStars(); // Вызываем функцию переключения звезд и гифки

        // Перезагружаем страницу, чтобы применить изменения
        location.reload();
    });

    // Вызов функции при загрузке страницы
    toggleStars();
});

// Обработчик клика
document.getElementById('heart-canvas').addEventListener('click', () => {
    const clickMessage = document.getElementById('click-message');
    const stars = document.querySelectorAll('.star');

    // Плавное исчезновение надписи
    clickMessage.style.opacity = '0.8';
    void clickMessage.offsetWidth; // Принудительный рефлоу
    clickMessage.style.animation = 'none';
    clickMessage.classList.add('fade-out');

    // Исчезновение сердечка
    c.style.opacity = '1';
    setTimeout(() => {
        c.style.opacity = '0';
    }, 0);

    // Анимация звезд
    stars.forEach((star) => {
        star.style.opacity = '0';
        setTimeout(() => {
            star.style.opacity = '1';
        }, Math.random() * 2000);
    });

    // Анимация основного сообщения
    anime({
        targets: congratsMessage,
        translateY: '-100vh',
        opacity: 0,
        duration: 2000,
        easing: 'easeInOutQuad',
        complete: () => {
            const today = getCurrentDate();
            
            if (today >= march10) {
                // День рождения - показываем дополнительное сообщение с подарком
                additionalMessage.innerHTML = `
                    <div class="message-content">
                        <span class="highlight">Братанчик</span>, поздравляю тебя с Днём Рождения! 🎉
                        <div class="gift-container">
                            <div class="gift-box bounce" onclick="handleGiftClick(this)">🎁</div>
                            <div class="gift-hint">нажми на меня</div>
                        </div>
                    </div>
                `;
                additionalMessage.classList.add('show');
            } else if (today < march8) {
                const daysToMarch8 = getDaysDifference(today, march8);
                const daysWord = getDaysWord(daysToMarch8);
                additionalMessage.innerHTML = `
                    <div class="message-content">
                        <span class="highlight">Мадам!</span> Ждите 8 марта! До него осталось ${daysToMarch8} ${daysWord}, 
                        а потом и уже ваш день рождения, а точнее через ${getDaysDifference(today, march10)} ${getDaysWord(getDaysDifference(today, march10))}.
                        <div class="birthday-note">
                            Не забудь открыть этот сайт ещё раз в свой день рождения, жишь! <span class="gift-emoji">🎁</span>
                        </div>
                    </div>
                `;
            } else if (today >= march8 && today < march9) {
                // Поздравление на 8 марта
                additionalMessage.innerHTML = `
                    <div class="message-content">
                    <span class="highlight">Братанчик</span>, поздравляю тебя с <span class="accent">ЖОСКИМ ВУМЕН</span> днём, жишь! 
                    В этот праздник ты можешь просто продолжать быть <span class="qualities">лучшей, прикольной, забавной и крутой</span> 
                    (ну как обычно). Крч, желаю тебе всего самого лучшего, не болей и радуйся побольше!)
                    <div class="birthday-note">
                        А ещё <span class="highlight">10 марта в 00:00</span> на этой же странице появится подарок на твой день рождения. 
                        Так что не забудь открыть этот сайт ещё раз в свой день рождения, жишь! <span class="gift-emoji">🎁</span>
                    </div>
                </div>
            `;
            } else if (today >= march9 && today < march10) {
                const daysToMarch10 = getDaysDifference(today, march10);
                additionalMessage.innerHTML = `
                    <div class="message-content">
                        <span class="highlight">Мадам!</span> 8 марта уже было, хмм, а теперь осталось ждать <span class="accent">${daysToMarch10}</span> дней до вашего дня рождения!)
                        <div class="birthday-note">
                            Не забудь открыть этот сайт ещё раз в свой день рождения, жишь! <span class="gift-emoji">🎁</span>
                        </div>
                    </div>
                `;
            }

            anime({
                targets: additionalMessage,
                opacity: 1,
                translateY: 0,
                duration: 1500,
                easing: 'easeOutQuad'
            });
        }
    });
});

// Добавим глобальную функцию для обработки клика по подарку
function handleGiftClick(giftElement) {
    const messageContent = giftElement.closest('.message-content');
    
    messageContent.innerHTML = `
        <div class="message-content" style="display: flex; justify-content: center; align-items: center; width: 100%; height: 100%;">
            <div class="joke-text">
                <div>Нету ручек, нет конфетки)</div>
                <span class="small-text">ладно. Шучу...</span>
            </div>
        </div>
    `;

    // Анимируем появление текста через anime.js вместо CSS анимации
    anime({
        targets: '.joke-text',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 1000,
        easing: 'easeOutQuad',
        complete: () => {
            // Через 3 секунды показываем второй подарок
            setTimeout(() => {
                messageContent.innerHTML = `
                    <div class="gift-container">
                        <div class="gift-box glow-on-hold">🎁</div>
                        <div class="gift-hint">зажми меня</div>
                    </div>
                `;
                
                initHoldGift(messageContent);
            }, 3000);
        }
    });
}

// Обработчик движения мыши для звезд
let prevMouseX = 0;
let prevMouseY = 0;
let mouseVelocityX = 0;
let mouseVelocityY = 0;

let starsElements = document.querySelectorAll('.star');
let repelRadius = 100;
let repelStrength = 0.5;
let velocity = [];
let positions = [];

// Инициализация позиций и скоростей
for (let i = 0; i < starsElements.length; i++) {
    velocity.push({ 
        x: Math.random() * 2 - 1, 
        y: Math.random() * 2 - 1 
    });
    const rect = starsElements[i].getBoundingClientRect();
    positions.push({ 
        x: rect.left + rect.width / 2, 
        y: rect.top + rect.height / 2 
    });
}

function updateStars() {
    const mouseX = prevMouseX;
    const mouseY = prevMouseY;

    mouseVelocityX = (mouseX - prevMouseX) / 10;
    mouseVelocityY = (mouseY - prevMouseY) / 10;

    starsElements.forEach((star, index) => {
        const dx = mouseX - positions[index].x;
        const dy = mouseY - positions[index].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < repelRadius) {
            const directionX = dx / distance;
            const directionY = dy / distance;
            const force = (repelRadius - distance) / repelRadius;

            velocity[index].x += -directionX * force * repelStrength * 5;
            velocity[index].y += -directionY * force * repelStrength * 5;
        }

        positions[index].x += velocity[index].x;
        positions[index].y += velocity[index].y;

        velocity[index].x *= 0.95;
        velocity[index].y *= 0.95;

        const maxSpeed = 10;
        if (Math.abs(velocity[index].x) > maxSpeed) {
            velocity[index].x = Math.sign(velocity[index].x) * maxSpeed;
        }
        if (Math.abs(velocity[index].y) > maxSpeed) {
            velocity[index].y = Math.sign(velocity[index].y) * maxSpeed;
        }

        star.style.transform = `translate(
            ${positions[index].x - (star.getBoundingClientRect().left + star.getBoundingClientRect().width / 2)}px, 
            ${positions[index].y - (star.getBoundingClientRect().top + star.getBoundingClientRect().height / 2)}px
        )`;
    });

    requestAnimationFrame(updateStars);
}

document.addEventListener('mousemove', (event) => {
    prevMouseX = event.clientX;
    prevMouseY = event.clientY;
});

updateStars();

// Добавим переменную для отслеживания существующего контейнера конфетти
let confettiInstance = null;

// Функция для создания конфетти
function createConfetti() {
    // Останавливаем предыдущий экземпляр, если он существует
    if (confettiInstance) {
        confettiInstance.stop();
    }
    
    const confettiContainer = document.createElement('div');
    confettiContainer.classList.add('js-container');
    document.body.appendChild(confettiContainer);
    confettiInstance = new Confettiful(confettiContainer);
}

// Обновляем класс Confettiful чтобы добавить возможность остановки
class Confettiful {
    constructor(el) {
        this.el = el;
        this.containerEl = null;
        this.confettiInterval = null;
        this.confettiPool = []; // Пул переиспользуемых конфетти
        this.poolSize = 100;
        
        // Добавляем цвета и типы анимаций
        this.confettiColors = [
            '#fce18a', '#ff726d', '#b48def', '#f4306d',
            '#ff69b4', '#7ee3ff', '#9fe7c3', '#e1a0ff'
        ];
        this.confettiAnimations = ['slow', 'medium', 'fast'];
        
        this._setupElements();
        this._initPool();
        this._renderConfetti();
    }
    
    _setupElements() {
        const containerEl = document.createElement('div');
        const elPosition = this.el.style.position;
        
        if (elPosition !== 'relative' || elPosition !== 'absolute') {
            this.el.style.position = 'relative';
        }
        
        containerEl.classList.add('confetti-container');
        this.el.appendChild(containerEl);
        this.containerEl = containerEl;
    }
    
    _initPool() {
        for (let i = 0; i < this.poolSize; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti');
            this.confettiPool.push(confetti);
        }
    }
    
    _renderConfetti() {
        this.confettiInterval = setInterval(() => {
            const confetti = this.confettiPool.pop();
            if (!confetti) return;
            
            this._resetConfetti(confetti);
            this.containerEl.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode === this.containerEl) {
                    this.containerEl.removeChild(confetti);
                }
                this.confettiPool.push(confetti);
            }, 3000);
        }, 25);
    }
    
    _resetConfetti(confetti) {
        const size = (Math.floor(Math.random() * 3) + 7) + 'px';
        const color = this.confettiColors[Math.floor(Math.random() * this.confettiColors.length)];
        const animation = this.confettiAnimations[Math.floor(Math.random() * this.confettiAnimations.length)];
        
        confetti.style.cssText = `
            left: ${Math.floor(Math.random() * this.el.offsetWidth)}px;
            width: ${size};
            height: ${size};
            background-color: ${color};
            transform: translateZ(0);
        `;
        confetti.className = `confetti confetti--animation-${animation}`;
    }
    
    stop() {
        clearInterval(this.confettiInterval);
        if (this.containerEl) {
            this.containerEl.remove();
        }
    }
}

// Обновляем админ-панель
document.addEventListener('DOMContentLoaded', () => {
    const adminButton = document.getElementById('admin-button');
    const adminModal = document.getElementById('admin-modal');
    const closeModal = document.querySelector('.close-modal');
    const passwordSection = document.querySelector('.password-section');
    const dateSection = document.querySelector('.date-section');
    const passwordInput = document.getElementById('admin-password');
    const dateInput = document.getElementById('custom-date');
    const applyButton = document.getElementById('apply-date');
    const resetButton = document.getElementById('reset-date');

    // Открытие модального окна
    adminButton.addEventListener('click', () => {
        adminModal.classList.add('show');
        passwordInput.value = '';
        passwordInput.focus();
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', () => {
        adminModal.classList.remove('show');
        passwordSection.style.display = 'block';
        dateSection.style.display = 'none';
    });

    // Проверка пароля
    passwordInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter' && passwordInput.value === '5790') {
            passwordSection.style.display = 'none';
            dateSection.style.display = 'block';
            dateInput.focus();
        }
    });

    // Применение даты
    applyButton.addEventListener('click', () => {
        if (dateInput.value) {
            customDate = new Date(dateInput.value);
            localStorage.setItem('customDate', dateInput.value);
            updateDateIndicator(); // Добавляем эту строку
            location.reload();
        }
    });

    // Сброс даты
    resetButton.addEventListener('click', () => {
        customDate = null;
        localStorage.removeItem('customDate');
        updateDateIndicator(); // Добавляем эту строку
        location.reload();
    });

    // Закрытие по клику вне модального окна
    document.addEventListener('click', (e) => {
        if (!adminModal.contains(e.target) && e.target !== adminButton) {
            adminModal.classList.remove('show');
            passwordSection.style.display = 'block';
            dateSection.style.display = 'none';
        }
    });
});

// Функция для управления этапами поздравления
function initBirthdayStages() {
    const stage1 = document.querySelector('.stage-1');
    const stage2 = document.querySelector('.stage-2');
    const stage3 = document.querySelector('.stage-3');
    const stage4 = document.querySelector('.stage-4');
    
    // Обработчик первого подарка
    const firstGift = stage1.querySelector('.gift-box');
    firstGift.addEventListener('click', () => {
        // Убираем сердце
        const heartCanvas = document.getElementById('heart-canvas');
        heartCanvas.style.display = 'none';
        
        // Убираем текст поздравления, оставляем только звезды и контейнер
        const messageContent = document.querySelector('.message-content');
        messageContent.innerHTML = `
            <div class="joke-text" style="opacity: 0">
                Нету ручек, нет конфетки) <br>
                <span class="small-text">А потом ладно. Шучу...</span>
            </div>
        `;
        
        // Анимируем появление текста
        anime({
            targets: '.joke-text',
            opacity: 1,
            duration: 1000,
            easing: 'easeInOutQuad',
            complete: () => {
                // Через 3 секунды показываем второй подарок
                setTimeout(() => {
                    messageContent.innerHTML = `
                        <div class="gift-container">
                            <div class="gift-box glow-on-hold">🎁</div>
                            <div class="gift-hint">зажми меня</div>
                        </div>
                    `;
                    
                    // Инициализируем обработчик зажатия
                    initHoldGift(messageContent);
                }, 3000);
            }
        });
    });
}

// Обновляем массив сообщений от друзей
const friendsMessages = [
    {
        name: 'Руби',
        avatar: 'images/RuBi_5_11zon.jpg',
        message: `Поздравления дальше будут не фейком, и их писал не я!`
    },
    {
        name: 'Птичка',
        avatar: 'images/Pho_4_11zon.jpg',
        message: `Поздравление в тг)`
    },
    {
        name: 'CeZaRi',
        avatar: 'images/CeZaRi_1_11zon.jpg',
        message: `Братанчик с днем рождения ебанный рот сука блять!!! 🎉<br><br>
                 Желаю тебе ахахахахуенного настроения до следуещего года и кароче что бы здоровье хорошее было ебать!!! 💪<br><br>
                 (Ну ты кароче там дома не еблань нахуй) ииииии всееее 😎`
    },
    {
        name: 'Дуник',
        avatar: 'images/Dunik_2_11zon.png',
        message: `(Дуник ОЧЕНЬ сильно занят, и не смог ответить! 😅) Но мы все знаем, что Дуник пожелает тебе всего самого наилучшего, веселья, конструктивного времяпрепровождения и чтобы Ха-ха ловила почаще! 🍀 Желает тебе ярких впечатлений, новых открытий и отличного настроения! 😊`
    },
    {
        name: 'Xonk',
        avatar: 'images/Xonk_6_11zon.jpg',
        message: `зефуняя, с днем рожденияяя!!! 
желаю тебе всего самого наилучшего, всего самого хорошего, много помидорчиков черри и всех самых хороших папиков,а ещё всего всего всего другого! живи и радуйся жизни и играй со своей калимбой!`
    },
    {
        name: 'Нубик 🔥',
        avatar: 'images/Noob_3_11zon.jpg',
        message: `Моя хорошая Фунечка. Мы уже почти год знакомы. Я помню нашу первую встречу. Тогда я была жуткой 📳социопаткой и мне тяжело было с кем-то знакомиться, поэтому первое время мне казалось, что тебе плевать на меня. Но чуть позже, когда мы обе начали искать друг друга по серверам в леталке, моей сердце растаяло. 🐱Тогда мы обменялись дискордами, позже тг каналами и стали очень неразлучны. ☯️Мне радостно было в душе наблюдать за твоим личностным ростом и грустно видеть, как тебя обижают люди из прошлого. Я очень рада, что сейчас ты свободна от этого. 🛐Я надеюсь, что вы с родителями поскорее найдете ту самую квартиру, в которой будет комфортно жить, чтоб вкусняшки твои никогда не заканчивались, а ссоры испарились. Чтоб ты смогла рубить деньги просто так, ничего не делая. Можешь даже обмануть какого-нибудь мальчика ради этого 🕯️😔
        Ты действительно самая уникальная моя подруга, 💞и я очень тобой дорожу и люблю. Надеюсь наша дружба продлится как можно дольше 🍑🍑🍑🍑🧡🧡🧡🧡`
    },
    {
        name: 'Jeniy 🔥',
        avatar: 'images/Jele.jpg',
        message: `Привет дорогая Зефун!
                Именно сегодня, в этот знаменательный день, ты становишься на год старше, и это действительно очень замечательное и знаменательное событие для нас всех!
                И в этот особенный день тебе исполняется целых 20 лет! Пусть этот год, и последующие для тебя будут полны только ярких эмоций, смеха и новых открытий! А также вдохновения, радости и только позитива!!! Желаю тебе находить счастье и позитив в мелочах, верить в себя и свои способности! Ни в коем случае не бойся мечтать и стремиться к этим мечтам! И помни, что если у тебя будут какие-либо трудности, у тебя есть твои друзья и родные, которые всегда поддержат и помогут!!!
                В этот особенный праздник я хочу искренне пожелать тебе исключительно всего только самого наилучшего! Оставайся такой же весёлой, умной, доброй, и энергичной! 
                Желаю тебе побольше удачи, вдохновения, мотивации к совершенствованию, благоразумия и конечно же, побольше здоровья!!! 
                Пусть этот день будет для тебя, незабываемым, весёлым, полным удивления и радости, а также, окружён приятными сюрпризами, близкими и друзьями!!!
                И не забывай, что 20 лет - это лишь только начало! И это время, когда ты можешь открывать для себя что-то новое, ставить перед собой какие-нибудь цели, и идти к светлому будущему, наполненным позитивом и радостями! И хоть жизнь, это сложная штука, помни, что если тебя попытаются сломить, ТЫ сломи их!
                Ещё раз желаю тебе отметить этот день рождения только с позитивом и радостью!`
    },
    {
        name: 'Руби 🔥',
        avatar: 'images/RuBi_5_11zon.jpg',
        message: `Зефун Зефун Зефун, поздравляю с днём рождения 😔<br><br>
                 Ты теперь не 19-летняя бабушка, а 20-летняя БАБУСЯ.<br><br>
                 Желаю тебе всего самого наилучшего, чтобы рядом с тобой были те люди, которые действительно тебя любят, ценят и уважают.<br><br>
                 Желаю найти ту самую цель, которую ты будешь хотеть достичь, и будешь над этим РЕАЛЬНО работать. И работать в плане заработка — это одно, а работать над своей целью — это уже совсем другое, братанчик. Сам по себе знаю, что в этом есть какой-то прикол.<br><br>
                 Денюшек побольше и всего побольше, чтобы ты могла купить новый компьютер и играла во что хочешь).<br><br>
                 Самое главное — не болей и береги своё здоровье.<br><br>
                 А вообще от себя скажу, что ты мне очень дорога. Я действительно ценю тебя и дорожу тобой. И недавно я писал: с кем я больше всего времени провёл? Не то, что в Discord, а в жизни именно с девочкой.<br><br>
                 Я тебе поздравляю, для меня ты стала вообще самым первым человеком для всего, и я этому очень сильно рад. То, что моя любовь не была как у других пубертатов — "Ой, мили девочка, го встреч?" Пон? А нормально, где-то чего-то боялся, что-то лишнее говорил, но самое главное, что я всё это переборол.<br><br>
                 Ты реально очень хорошая, добрая, крутая, веселая, и с тобой не скучно. Кстати, у тебя там коты танцуют на плете).<br><br>
                 На самом деле я думаю, ты уже поняла, что этот сайт я сделал САМ, без какой-либо помощи. Это заняло у меня довольно много времени, и такой сайт в реале бы обошёлся людям в круглую сумму ТАК ТО. Мне даже не впадлу было ПОЛНОСТЬЮ переделывать весь сайт под телефон!!! Изначально я хотел сделать его для ПК, но потом, как узнал, что ты будешь в другом городе, это прям сделало мне такой КОНКРЕТННЫЙ -Вайб. Кстати, сообщения выше РЕАЛЬНО были не фейком, ДА ДА, А ТЫ НЕ ВЕРИЛА, и их писал не я! Я реально взял и заморочился, у каждого спросил, каждого добавил, чтобы тебе было приятно). НО для тебя, братанчик, такого рода подарок сделать не жалко — потратить своё время, сделать что-то самому, чтобы тебе было приятно. Надеюсь, я хоть немного скрасил тебе твой день рождения и 8 марта 😏👌`
    },
];

function showNextMessage(container, index = 0) {
    if (index >= friendsMessages.length) return;

    const friend = friendsMessages[index];
    const friendCard = document.createElement('div');
    friendCard.className = 'wish-card';
    friendCard.style.opacity = '0';
    friendCard.innerHTML = `
        <div class="friend-info">
            ${friend.avatar ? `<img src="${friend.avatar}" class="friend-avatar" alt="${friend.name}">` : ''}
            <div class="friend-name">${friend.name}</div>
        </div>
        <div class="message-container">
            <div class="typing-status">
                печатает
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        </div>
    `;

    container.querySelector('.friends-wishes').appendChild(friendCard);

    // Обновляем прокрутку к новой карточке
    setTimeout(() => {
        friendCard.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' // Изменяем на 'nearest' для более плавной прокрутки
        });
    }, 100);

    // Анимируем появление карточки
    anime({
        targets: friendCard,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 500,
        easing: 'easeOutCubic',
        complete: () => {
            // Через 4 секунды показываем сообщение
            setTimeout(() => {
                const messageContainer = friendCard.querySelector('.message-container');
                messageContainer.innerHTML = `
                    <div class="message-bubble" style="opacity: 0; transform: translateX(-20px);">
                        <div class="message-content">
                            ${friend.message}
                            <div class="message-time">
                                ${new Date().toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                                <span class="message-status">✓✓</span>
                            </div>
                        </div>
                    </div>
                `;

                // Анимируем появление сообщения
                const messageBubble = messageContainer.querySelector('.message-bubble');
                anime({
                    targets: messageBubble,
                    opacity: [0, 1],
                    translateX: [-20, 0],
                    duration: 600,
                    easing: 'easeOutCubic',
                    complete: () => {
                        // Добавляем кнопку "Продолжить", если есть следующее сообщение
                        if (index < friendsMessages.length - 1) {
                            const buttonContainer = document.createElement('div');
                            buttonContainer.className = 'continue-button-container';
                            
                            const continueButton = document.createElement('button');
                            continueButton.className = 'continue-button';
                            continueButton.textContent = 'Продолжить';
                            
                            buttonContainer.appendChild(continueButton);
                            messageContainer.appendChild(buttonContainer);

                            continueButton.addEventListener('click', () => {
                                buttonContainer.style.display = 'none';
                                showNextMessage(container, index + 1);
                            });
                        }
                    }
                });
            }, 4000);
        }
    });
}

function initHoldGift(container) {
    const gift = container.querySelector('.gift-box');
    let holdTimer;
    let isHolding = false;
    
    function startHolding(e) {
        isHolding = true;
        gift.classList.add('active');
        
        holdTimer = setTimeout(() => {
            if (isHolding) {
                gift.classList.add('explode');
                createMassiveConfetti();
                
                // Убираем min-height и показываем контейнер сразу
                container.innerHTML = `
                    <div class="friends-wishes" style="opacity: 0"></div>
                `;

                // Анимируем появление контейнера
                anime({
                    targets: '.friends-wishes',
                    opacity: 1,
                    duration: 500,
                    easing: 'easeOutCubic',
                    complete: () => {
                        showNextMessage(container);
                    }
                });
            }
        }, 2000);
    }
    
    function stopHolding() {
        isHolding = false;
        clearTimeout(holdTimer);
        gift.classList.remove('active');
    }
    
    gift.addEventListener('mousedown', startHolding);
    gift.addEventListener('touchstart', startHolding, { passive: true });
    
    gift.addEventListener('mouseup', stopHolding);
    gift.addEventListener('touchend', stopHolding);
    gift.addEventListener('mouseleave', stopHolding);
}

// Функция для создания массивного залпа конфетти
function createMassiveConfetti() {
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createConfetti();
        }, i * 200);
    }
}

// Добавляем обработку ошибок
window.addEventListener('error', function(e) {
    console.error('Error:', e.message);
    // Можно добавить восстановление после ошибок
});

// Оптимизация для мобильных устройств
if ('ontouchstart' in window) {
    document.documentElement.style.touchAction = 'manipulation';
}

// Функция для переключения звезд и гифки
function toggleStars() {
    const starsContainer = document.getElementById('stars');
    if (highPerformanceMode) {
        // Удаляем звезды
        starsContainer.innerHTML = '';
        
        // Добавляем гифку
        const existingGif = document.querySelector('body > img[src="images/stars-galaxy.gif"]');
        if (!existingGif) {
            const gif = document.createElement('img');
            gif.src = 'images/stars-galaxy.gif'; // Убедитесь, что путь правильный
            gif.style.width = '100%';
            gif.style.height = '100%';
            gif.style.top = '0';
            gif.style.left = '0';
            gif.style.zIndex = '0'; // Устанавливаем на задний план
            gif.style.pointerEvents = 'none'; // Чтобы клики проходили через гифку
            
            // Добавляем гифку в контейнер звезд
            starsContainer.appendChild(gif); // Теперь гифка будет добавлена в контейнер звезд
        }
    } else {
        // Удаляем гифку, если она есть
        const existingGif = document.querySelector('body > img[src="images/stars-galaxy.gif"]');
        if (existingGif) {
            existingGif.remove();
        }
        // Восстанавливаем звезды
        createStars(starsContainer, 300, 'star', 2, 2);
    }
}