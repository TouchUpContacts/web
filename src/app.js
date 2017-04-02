(function () {
  "use strict";

  let touchUpApp = {}, itemClickEventHandler;
  const slideContainerModifierRegExp = /slide-container--[a-z\-]+/g;

  touchUpApp.slideContainer = document.body;
  touchUpApp.navItems = Array.from(document.querySelectorAll('[data-step]'));
  touchUpApp.activeItem = touchUpApp.navItems[0];

  itemClickEventHandler = (e) => {
    let item = e.currentTarget;
    let itemDataset = item.dataset;
    let slideContainer = touchUpApp.slideContainer;
    let slideContainerModifierClass = `slide-container--${itemDataset.step}`;

    touchUpApp.activeItem.classList.remove('item--active');
    item.classList.add('item--active');
    touchUpApp.activeItem = item;

    slideContainer.className = slideContainer.className.replace(slideContainerModifierRegExp, slideContainerModifierClass);
  }

  touchUpApp.navItems.forEach((item) => {
    item.addEventListener('click', itemClickEventHandler);
  });

  window.TouchUpApp = window.TouchUpApp || Object.create(touchUpApp);
}());