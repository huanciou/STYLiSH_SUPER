import { CAMPAIGNS_API } from "./api.const.js";

async function fetchCampaigns() {
  const response = await fetch(CAMPAIGNS_API);
  const result = await response.json();
  return result.data;
}

function renderControlItems(campaignsCount) {
  const carouselControls = document.querySelector(".carousel__controls");
  Array(campaignsCount)
    .fill()
    .forEach((_, index) => {
      const controlsItem = document.createElement("div");
      controlsItem.classList.add("controls__item");
      controlsItem.setAttribute("id", index);
      carouselControls.appendChild(controlsItem);
    });
}

function generateCampaign(data) {
  const campaign = document.createElement("a");
  const campaignImage = document.createElement("div");
  const campaignStory = document.createElement("div");
  const storyContent = document.createElement("div");
  const storyTitle = document.createElement("div");

  campaign.setAttribute("href", `product.html?id=${data.product_id}`);
  campaign.classList.add("campaign");
  campaignImage.classList.add("campaign__img");
  campaignStory.classList.add("campaign__story");
  storyContent.classList.add("story__content");
  storyTitle.classList.add("story__title");

  campaignStory.appendChild(storyContent);
  campaignStory.appendChild(storyTitle);

  campaignImage.style.backgroundImage = `url(${data.picture})`;
  storyContent.innerText = data.story.split("\r\n").slice(0, 3).join("\r\n");
  storyTitle.innerText = data.story.split("\r\n")[3];

  campaign.appendChild(campaignImage);
  campaign.appendChild(campaignStory);

  return campaign;
}

function renderCampaigns(campaignsData) {
  const sectionCarousel = document.querySelector(".carousel");
  const campaigns = campaignsData.map(generateCampaign);
  campaigns.forEach((ele) => {
    sectionCarousel.appendChild(ele);
  });
}

function bindClickEvent(callback) {
  const controlsItems = document.querySelectorAll(".controls__item");
  controlsItems.forEach((item) => {
    item.addEventListener("click", callback);
  });
}

function bindHoverEvent(onMouseEnter, onMouseLeave) {
  const carouselControls = document.querySelector(".carousel__controls");
  carouselControls.addEventListener('mouseenter', onMouseEnter);
  carouselControls.addEventListener('mouseleave', onMouseLeave);
}

function showCampaign(index) {
  const carousels = document.querySelectorAll(".campaign");
  carousels[index].classList.add("campaign--active");
  const controlsItem = document.querySelectorAll(".controls__item");
  controlsItem[index].classList.add("controls__item--active");
}

function hideCampaign(index) {
  const carousels = document.querySelectorAll(".campaign");
  carousels[index].classList.remove("campaign--active");
  const controlsItem = document.querySelectorAll(".controls__item");
  controlsItem[index].classList.remove("controls__item--active");
}

let activeIndex = 0;
let maxIndex = 0;
let intervalId;

function changeCampaign(targetIndex) {
  hideCampaign(activeIndex);
  if (typeof targetIndex === "number") {
    activeIndex = targetIndex;
  } else {
    activeIndex =
      activeIndex === maxIndex ? 0 : Math.min(activeIndex + 1, maxIndex);
  }
  showCampaign(activeIndex);
}

function onClickControlItem(event) {
  const targetIndex = Number(event.target.id);
  if (activeIndex === targetIndex) return;
  if (intervalId) {
    clearInterval(intervalId);
  }
  changeCampaign(targetIndex);
}

function onMouseEnter() {
  clearInterval(intervalId);
}

function onMouseLeave() {
  intervalId = setInterval(changeCampaign, 5000);
}

async function loadCarousel() {
  const campaignsData = await fetchCampaigns();
  const campaignsCount = campaignsData.length;
  maxIndex = campaignsCount - 1;
  renderCampaigns(campaignsData);
  renderControlItems(campaignsCount);
  showCampaign(activeIndex);
  intervalId = setInterval(changeCampaign, 5000);
  bindClickEvent(onClickControlItem);
  bindHoverEvent(onMouseEnter, onMouseLeave);
}

loadCarousel();
