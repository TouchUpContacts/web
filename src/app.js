(function () {
  "use strict";

  let touchUpApp = {}, itemClickEventHandler;
  const slideContainerModifierRegExp = /slide-container--[a-z\-]+/g;

  touchUpApp.slideContainer = document.body;
  touchUpApp.navItems = Array.from(document.querySelectorAll('[data-step]'));
  touchUpApp.activeItem = touchUpApp.navItems[0];
  touchUpApp.slides = Array.from(document.querySelectorAll('section'));
  touchUpApp.activeSlide = touchUpApp.slides[0];
  touchUpApp.screensContainer = document.querySelector('.phone__images');
  touchUpApp.activeScreenOffset = 0;

  itemClickEventHandler = (e) => {
    let item = e.currentTarget;
    let itemDataset = item.dataset;
    let slideContainer = touchUpApp.slideContainer;
    let slideContainerModifierClass = `slide-container--${itemDataset.step}`;
    let previousSlide = document.querySelector(`.${itemDataset.previous}`);
    let slide = document.querySelector(`.${itemDataset.step}`);

    touchUpApp.activeItem.classList.remove('item--active');
    item.classList.add('item--active');
    touchUpApp.activeItem = item;

    slideContainer.className = slideContainer.className.replace(slideContainerModifierRegExp, slideContainerModifierClass);

    slide.classList.add(`${itemDataset.step}--active`);
    slide.classList.remove(`${itemDataset.step}--leaved`);

    if(previousSlide) {
      const activeSlideClassRegExp = new RegExp(`${itemDataset.previous}--active`, 'g');
      previousSlide.className = previousSlide.className.replace(activeSlideClassRegExp, `${itemDataset.previous}--leaved`);
    }

    touchUpApp.activeSlide.classList.remove(`${touchUpApp.activeSlide.dataset.name}--active`);
    touchUpApp.activeSlide = slide;
    touchUpApp.screensContainer.style.transform = `translate3d(0, -${(parseInt(itemDataset.screen) - 1) * 373}px, 0)`;

  }

  touchUpApp.navItems.forEach((item) => {
    item.addEventListener('click', itemClickEventHandler);
  });

  window.TouchUpApp = window.TouchUpApp || Object.create(touchUpApp);
}());