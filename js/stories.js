"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);
  let checkboxStatus = "";
  let favorite = "";
  let remove = "";
  if (currentUser) {
    if (currentUser.isFavorite(story)) {
      checkboxStatus = "checked";
    }
    favorite = `<input type="checkbox" class="fav-check" ${checkboxStatus}/>`;
    if (story.username === currentUser.username) {
      remove = '<a href="#" class="remove-story">remove</a>';
    }
  }

  const hostName = story.getHostName();
  return $(`
      <li id="${story.storyId}">
      ${favorite}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        ${remove}
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Gets list of favorites from server, generates their HTML, and puts on page. */

function putFavoritesOnPage() {
  console.debug("putFavoritesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

/** Handle submit form submission. */

async function submit(evt) {
  console.debug("submit", evt);
  evt.preventDefault();

  const title = $("#submit-title").val();
  const author = $("#submit-author").val();
  const url = $("#submit-url").val();

  await storyList.addStory(currentUser, { title, author, url });

  hidePageComponents();
  putStoriesOnPage();
}

$submitForm.on("submit", submit);

/** Handle updating favorites on click of checkbox */

async function updateFavorite(evt) {
  console.debug("updateFavorite", evt);
  const story = storyList.stories.find(story =>
    story.storyId === evt.target.closest("li").id);
  currentUser.toggleFavorite(story);
}

$allStoriesList.change("checkbox", updateFavorite);

/** Handle removing stories. */

async function removeStory(evt) {
  console.debug("removeStory", evt);
  evt.preventDefault();
  const story = storyList.stories.find(story =>
    story.storyId === evt.target.closest("li").id);
  await currentUser.removeStory(story);
  putStoriesOnPage();
}

$allStoriesList.on("click", ".remove-story", removeStory);