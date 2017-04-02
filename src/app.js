(function () {
  "use strict";

  let touchUpApp = {}, itemClickEventHandler;
  const slideContainerModifierRegExp = /slide-container--[a-z\-]+/g;

  touchUpApp.slideContainer = document.body;
  touchUpApp.navItems = Array.from(document.querySelectorAll('[data-step]'));

  itemClickEventHandler = (e) => {
    let itemDataset = e.currentTarget.dataset;
    let slideContainer = touchUpApp.slideContainer;
    let slideContainerModifierClass = `slide-container--${itemDataset.step}`;

    slideContainer.className = slideContainer.className.replace(slideContainerModifierRegExp, slideContainerModifierClass);
  }

  touchUpApp.navItems.forEach((item) => {
    item.addEventListener('click', itemClickEventHandler);
  });

  window.TouchUpApp = window.TouchUpApp || Object.create(touchUpApp);
}());