import createElement from '../../assets/lib/create-element.js';

export default class StepSlider {

  constructor({ steps, value = 0 }) {
    this.elem = this.#innerElem(steps)
  }

  /* Получение верстки */
  #innerElem(steps) {
    let elemBefore = createElement(
      `
      <!--Корневой элемент слайдера-->
      <div class="slider">

      <!--Ползунок слайдера с активным значением-->
      <div class="slider__thumb" style="left: 0%;">
      <span class="slider__value">0</span>
      </div>

      <!--Заполненная часть слайдера-->
      <div class="slider__progress" style="width: 0%;"></div>

      <!--Шаги слайдера-->
      <div class="slider__steps">
      <span></span>
      <span></span>
      <span class="slider__step-active"></span>
      <span></span>
      <span></span>
      </div>
      </div>
      `
    )

    /* Добавление SPAN по количеству шагов */
    let elemSteps = elemBefore.querySelector('.slider__steps')
    elemSteps.innerHTML = ''

    for (let i = 0; i < steps; i++) {
      let elemStep = document.createElement('SPAN')
      if (i == 0) {
        elemStep.classList.add('slider__step-active')
      }
      elemSteps.append(elemStep)
    }

    /* Обработка событий клика */
    elemBefore.addEventListener('click', coordProc)

    function coordProc(event) {

      let coordClck = event.clientX
      let numberStep = getNumberStep(this, coordClck) //номер шага

      /* Установка значения шага в SPAN */
      let elemSliderValue = document.querySelector('.slider__value')
      let sliderValueBefore = elemSliderValue.textContent
      elemSliderValue.textContent = numberStep
      let sliderValueAfter = elemSliderValue.textContent

      /* Условие подписки на событие */
      if (!(sliderValueBefore == sliderValueAfter)) {
        let custEvent = new CustomEvent('slider-change', {
          detail: +sliderValueAfter,
          bubbles: true
        }
        )
        elemBefore.dispatchEvent(custEvent)
      }

      let elemsSpanSliderArr = document.querySelectorAll('.slider__steps SPAN')
      /* Обработка активного SPAN */
      for (let el of elemsSpanSliderArr) {
        el.removeAttribute('class')
      }
      elemsSpanSliderArr[numberStep].classList.add('slider__step-active')

      let progress = numberStep * 100 / (steps - 1) //значение номера шага в %

      /* Обрабокта перемещения позунка */
      let elThumb = elemBefore.querySelector('.slider__thumb')
      elThumb.style.left = `${progress}%`

      /* Обработка ширины закрашиваемой области */
      let elThumbArea = elemBefore.querySelector('.slider__progress')
      elThumbArea.style.width = `${progress}%`

    }

    //Вычисление значения ближайшего шага
    let getNumberStep = (elBtn, coordClck) => {

      let box = elBtn.getBoundingClientRect()
      let elLeft = box.left //левый угол
      let elRight = box.right //правый угол
      let elWidth = elRight - elLeft //длина элемента
      let elClick = coordClck //координаты клика
      let stepLength = elWidth / (steps - 1) //длина шага
      let arrCoord = [] //массив для ближайших координат
      let arrSteps = [] //массив для шагов

      let arrStep = 0 //счеттчик шага
      for (let i = elLeft; i <= elRight; i = i + stepLength) {
        let delta1 = elClick - i

        if (Math.abs(delta1) < stepLength) {
          arrCoord.push(i)
        }

        arrSteps.push(arrStep)
        arrStep++
      }

      let xCoord1 = Math.abs(arrCoord[0] - elClick) //дельта между кликом и левой кординатой
      let xCoord2 = Math.abs(arrCoord[1] - elClick) //дельта между кликом и правой кординатой
      let delta2 = Math.min(xCoord1, xCoord2) //минимальное расстояние между кликом и координатой

      let sliderCoord //координата ближайшего шага
      if (delta2 == xCoord1) {
        sliderCoord = arrCoord[0]
      } else if (delta2 == xCoord2) {
        sliderCoord = arrCoord[1]
      }

      /* Вычисление шага */
      let numberStep = 0
      for (let count of arrSteps) {

        if ((Math.abs(sliderCoord - (elLeft + count * stepLength))) < 1) {
          numberStep = count
          break;
        }

      }

      return numberStep
    }

    /* Drag & Drop */
  
    /* Отключение обработки перемещения по умолчанию */
    let elThumb = elemBefore.querySelector('.slider__thumb')
    let elThumbArea = elemBefore.querySelector('.slider__progress')
    elThumb.ondragstart = function () {
      return false
    }

  /* Обработка событий мыши */
    elemBefore.addEventListener('pointerdown', function (event1) {

      let valuSliderBefore = +elemBefore.querySelector('.slider__value').textContent //значение до перемещения

      let deltaSlider = elemBefore.getBoundingClientRect().left
      let currentCoordSlider = (x, y) => (x - y) * 100 / elemBefore.offsetWidth //кординаты в %
      let pastCoordSlider = (x, y) => (steps - 1) * currentCoordSlider(x, y) / 100

      elThumb.style.left = currentCoordSlider(event1.clientX, deltaSlider) + '%'
      elThumbArea.style.width = currentCoordSlider(event1.clientX, deltaSlider) + '%'
      let coordSlider = event1.clientX

      let currentStepSlider = Math.round(pastCoordSlider(coordSlider, deltaSlider))
      let elThumbSpan = elThumb.querySelector('SPAN')
      elThumbSpan.textContent = currentStepSlider

      elemBefore.classList.add('slider_dragging')

      function move(event) {

        if (!event1.target.closest('.slider__thumb')) return

        /* Обработка ширины закрашиваемой области */
        let currentCoord = event.clientX - deltaSlider
        let currentLeft = currentCoord * 100 / elemBefore.offsetWidth

        if (currentLeft < 0) {
          elThumb.style.left = '0%'
          elThumbArea.style.width = `0%`
        }
        else if (currentLeft > 100) {
          elThumb.style.left = '100%'
          elThumbArea.style.width = `100%`
        }
        else {
          elThumb.style.left = `${currentCoordSlider(event.clientX, deltaSlider)}%`
          elThumbArea.style.width = `${currentCoordSlider(event.clientX, deltaSlider)}%`
          let coordSlider = event.clientX

          let currentStepSlider = Math.round(pastCoordSlider(coordSlider, deltaSlider))
          let elThumbSpan = elThumb.querySelector('SPAN')
          elThumbSpan.textContent = currentStepSlider
        }

      }

      document.addEventListener('pointermove', move)

      document.addEventListener('pointerup', pointerUp, { once: true })

      function pointerUp(event2) {
        document.removeEventListener('pointermove', move)
        let coordSlider = event2.clientX

        let currentStepSlider = Math.round(pastCoordSlider(coordSlider, deltaSlider))

        elThumb.style.left = Math.round(pastCoordSlider(coordSlider, deltaSlider)) * 100 / (steps - 1) + '%'
        let elThumbSpan = elThumb.querySelector('.slider__value')
        elThumbSpan.textContent = currentStepSlider
        elThumbArea.style.width = Math.round(pastCoordSlider(coordSlider, deltaSlider)) * 100 / (steps - 1) + '%'
        let elSlSteps = elemBefore.querySelectorAll('.slider__steps SPAN')
        
        /* Обработка и добавление класса в SPAN шагов */
        for (let elemCurrentStep of elSlSteps) {
          elemCurrentStep.removeAttribute('class')
        }
        elSlSteps[currentStepSlider].classList.add('slider__step-active')

        elemBefore.classList.remove('slider_dragging')

        /* Пользовательское событие */
        if (!(valuSliderBefore == +currentStepSlider)) {

          let userEvent = new CustomEvent('slider-change', {
            detail: +currentStepSlider, // значение 0, 1, 2, 3, 4
            bubbles: true
          })

          elemBefore.dispatchEvent(userEvent)
        }
      }

    })

    return elemBefore
  }



}


