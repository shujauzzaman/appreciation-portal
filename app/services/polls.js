// TODO: no real "polls" collection/schema exists yet — this returns a
// static placeholder so WeeklyPoll.jsx has something to render. Once you
// design the real poll schema (e.g. weekly doc with a list of questions),
// swap this function's body for a Firestore fetch — the component won't
// need to change since it just awaits this function.
export async function fetchCurrentPollQuestion() {
  return {
    current: 1,
    total: 7,
    text: "Question Goes Here",
  };
}

// TODO: once real, this should record the logged-in user's rating for
// the current question (likely as a subcollection or a map keyed by uid,
// since answers are meant to be anonymous — don't store uid alongside
// the rating value itself in the readable document).
export async function submitPollRating(rating) {
  console.warn("submitPollRating is not wired to Firestore yet:", rating);
}