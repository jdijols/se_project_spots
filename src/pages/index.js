import "./index.css";
import {
  enableValidation,
  config,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";
import Api from "../utils/Api.js";

// DOM ELEMENT REFERENCES

// Page elements
const editAvatarBtn = document.querySelector(".profile__avatar-btn");
const profileAvatarEl = document.querySelector(".profile__avatar");
const profileNameEl = document.querySelector(".profile__name");
const profileDescriptionEl = document.querySelector(".profile__description");
const editProfileBtn = document.querySelector(".profile__edit-btn");
const newPostBtn = document.querySelector(".profile__new-btn");
const modals = document.querySelectorAll(".modal");

// Edit avatar modal elements
const editAvatarModal = document.querySelector("#edit-avatar-modal");
const editAvatarCloseBtn = editAvatarModal.querySelector(".modal__close-btn");
const editAvatarFormEl = editAvatarModal.querySelector(".modal__form");
const editAvatarInput = editAvatarModal.querySelector("#profile-avatar-input");
const editAvatarSubmitBtn = editAvatarModal.querySelector(".modal__button");

// Edit profile modal elements
const editProfileModal = document.querySelector("#edit-profile-modal");
const editProfileCloseBtn = editProfileModal.querySelector(".modal__close-btn");
const editProfileFormEl = editProfileModal.querySelector(".modal__form");
const editProfileNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editProfileDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileSubmitBtn = editProfileModal.querySelector(".modal__button");

// New post modal elements
const newPostModal = document.querySelector("#new-post-modal");
const newPostCloseBtn = newPostModal.querySelector(".modal__close-btn");
const newPostFormEl = newPostModal.querySelector(".modal__form");
const newPostLinkInput = newPostModal.querySelector("#image-link-input");
const newPostCaptionInput = newPostModal.querySelector("#caption-input");
const newPostSubmitBtn = newPostModal.querySelector(".modal__button");

// Preview post modal elements
const previewModal = document.querySelector("#preview-modal");
const previewModalCloseBtn = previewModal.querySelector(".modal__close-btn");
const previewImageEl = previewModal.querySelector(".modal__image");
const previewCaptionEl = previewModal.querySelector(".modal__caption");

// Delete post modal elements
const deletePostModal = document.querySelector("#delete-post-modal");
const deletePostCloseBtn = deletePostModal.querySelector(".modal__close-btn");
const deletePostFormEl = deletePostModal.querySelector("#delete-post-form");
const deletePostSubmitBtn = deletePostModal.querySelector(".modal__button_type_delete");
const deletePostCancelBtn = deletePostModal.querySelector(
  ".modal__button_type_cancel"
);

// Card elements
const cardTemplate = document
  .querySelector("#card-template")
  .content.querySelector(".card");
const cardsList = document.querySelector(".cards__list");
let selectedCard, selectedCardId;

// API INSTANCE

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "c2f31a89-a6b4-4dfc-9981-f2de219cf61f", // Replace with your actual token
    "Content-Type": "application/json",
  },
});

// INITIAL DATA LOAD

api
  .getAppInfo()
  .then(([cards, user]) => {
    profileNameEl.textContent = user.name;
    profileDescriptionEl.textContent = user.about;
    profileAvatarEl.src = user.avatar;
    profileAvatarEl.alt = user.name;

    cards.forEach((card) => {
      cardsList.append(getCardElement(card));
    });
  })
  .catch(console.error);

// FUNCTIONS & HANDLERS

// Base functions
function openModal(modal) {
  modal.classList.add("modal_is-opened");
  document.addEventListener("keydown", closeOnEscape);
}
function closeModal(modal) {
  modal.classList.remove("modal_is-opened");
  document.removeEventListener("keydown", closeOnEscape);
}
function setLikes(likeBtnEl, isLiked) {
  likeBtnEl.classList.toggle("card__like-btn_active", isLiked);
}
function setModalBtnText(button, isLoading, defaultText, loadingText) {
  button.textContent = isLoading ? loadingText : defaultText;
}
function getCardElement(data) {
  const cardElement = cardTemplate.cloneNode(true);
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardTitleEl = cardElement.querySelector(".card__title");
  const cardDeleteBtnEl = cardElement.querySelector(".card__delete-btn");
  const cardLikeBtnEl = cardElement.querySelector(".card__like-btn");
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;
  cardTitleEl.textContent = data.name;
  cardImageEl.addEventListener("click", () => {
    previewImageEl.src = data.link;
    previewImageEl.alt = data.name;
    previewCaptionEl.textContent = data.name;
    openModal(previewModal);
  });
  cardDeleteBtnEl.addEventListener("click", () =>
    handleDeleteCard(cardElement, data)
  );
  setLikes(cardLikeBtnEl, data.isLiked);
  cardLikeBtnEl.addEventListener("click", () =>
    handlePostLike(data, cardLikeBtnEl)
  );
  return cardElement;
}

// Submission handlers
function handleAvatarFormSubmit(evt) {
  evt.preventDefault();
  setModalBtnText(editAvatarSubmitBtn, true, "Save", "Saving...");
  api
    .editAvatarImage({ avatar: editAvatarInput.value })
    .then((data) => {
      profileAvatarEl.src = data.avatar;
      editAvatarFormEl.reset();
      closeModal(editAvatarModal);
      disableButton(editAvatarSubmitBtn, config);
    })
    .catch(console.error)
    .finally(() => {
      setModalBtnText(editAvatarSubmitBtn, false, "Save", "Saving...");
    });
}
function handleProfileFormSubmit(evt) {
  evt.preventDefault();
  setModalBtnText(editProfileSubmitBtn, true, "Save", "Saving...");
  api
    .editUserInfo({
      name: editProfileNameInput.value,
      about: editProfileDescriptionInput.value,
    })
    .then((data) => {
      profileNameEl.textContent = data.name;
      profileDescriptionEl.textContent = data.about;
      closeModal(editProfileModal);
    })
    .catch(console.error)
    .finally(() => {
      setModalBtnText(editProfileSubmitBtn, false, "Save", "Saving...");
    });
}
function handlePostFormSubmit(evt) {
  evt.preventDefault();
  setModalBtnText(newPostSubmitBtn, true, "Post", "Posting...");
  api
    .addNewPost({
      name: newPostCaptionInput.value,
      link: newPostLinkInput.value,
    })
    .then((data) => {
      cardsList.prepend(getCardElement(data));
      newPostFormEl.reset();
      closeModal(newPostModal);
      disableButton(newPostSubmitBtn, config);
    })
    .catch(console.error)
    .finally(() => {
      setModalBtnText(newPostSubmitBtn, false, "Post", "Posting...");
    });
}
function handleDeleteCard(cardElement, data) {
  selectedCard = cardElement;
  selectedCardId = data._id;
  openModal(deletePostModal);
}
function handleDeletePostSubmit(evt) {
  evt.preventDefault();
  setModalBtnText(deletePostSubmitBtn, true, "Delete", "Deleting...");
  api
    .deletePost(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deletePostModal);
      selectedCard = null;
      selectedCardId = null;
    })
    .catch(console.error)
    .finally(() => {
      setModalBtnText(deletePostSubmitBtn, false, "Delete", "Deleting...");
    });
}
function handlePostLike(cardData, likeBtnEl) {
  const isCurrentlyLiked = likeBtnEl.classList.contains(
    "card__like-btn_active"
  );
  api
    .togglePostLike(cardData._id, isCurrentlyLiked)
    .then((updatedPost) => {
      setLikes(likeBtnEl, updatedPost.isLiked);
    })
    .catch(console.error);
}

// Edit avatar listeners
editAvatarBtn.addEventListener("click", function () {
  resetValidation(editAvatarFormEl, [editAvatarInput], config);
  openModal(editAvatarModal);
});
editAvatarCloseBtn.addEventListener("click", function () {
  closeModal(editAvatarModal);
});
editAvatarFormEl.addEventListener("submit", handleAvatarFormSubmit);

previewModalCloseBtn.addEventListener("click", function () {
  closeModal(previewModal);
});

// Edit profile listeners
editProfileBtn.addEventListener("click", function () {
  editProfileNameInput.value = profileNameEl.textContent;
  editProfileDescriptionInput.value = profileDescriptionEl.textContent;
  resetValidation(
    editProfileFormEl,
    [editProfileNameInput, editProfileDescriptionInput],
    config
  );
  openModal(editProfileModal);
});
editProfileCloseBtn.addEventListener("click", function () {
  closeModal(editProfileModal);
});
editProfileFormEl.addEventListener("submit", handleProfileFormSubmit);

// New post listeners
newPostBtn.addEventListener("click", function () {
  openModal(newPostModal);
});
newPostCloseBtn.addEventListener("click", function () {
  closeModal(newPostModal);
});
newPostFormEl.addEventListener("submit", handlePostFormSubmit);

// Delete post listeners
deletePostCancelBtn.addEventListener("click", () =>
  closeModal(deletePostModal)
);
deletePostCloseBtn.addEventListener("click", () => closeModal(deletePostModal));
deletePostFormEl.addEventListener("submit", handleDeletePostSubmit);

// Close modal events
modals.forEach((modal) => {
  modal.addEventListener("mousedown", (evt) => {
    if (evt.target === modal) {
      closeModal(modal);
    }
  });
});
function closeOnEscape(evt) {
  if (evt.key === "Escape") {
    const openedModal = document.querySelector(".modal_is-opened");
    if (openedModal) closeModal(openedModal);
  }
}

// INIT

enableValidation(config);
