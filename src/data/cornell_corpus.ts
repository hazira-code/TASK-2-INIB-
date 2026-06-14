import { CorpusItem } from '../types';

export const DEFAULT_CORNELL_CORPUS: CorpusItem[] = [
  // Sci-Fi / Action
  {
    id: "m1",
    movieTitle: "The Matrix",
    genre: "Sci-Fi",
    characterA: "Neo",
    characterB: "Morpheus",
    prompt: "What is the Matrix?",
    response: "The Matrix is everywhere. It is all around us. Even now, in this very room."
  },
  {
    id: "m2",
    movieTitle: "The Matrix",
    genre: "Sci-Fi",
    characterA: "Neo",
    characterB: "Morpheus",
    prompt: "What are you trying to tell me? That I can dodge bullets?",
    response: "No, Neo. I'm trying to tell you that when you're ready, you won't have to."
  },
  {
    id: "m3",
    movieTitle: "The Matrix",
    genre: "Sci-Fi",
    characterA: "Cypher",
    characterB: "Agent Smith",
    prompt: "Ignorance is bliss.",
    response: "Then we have a deal, Mr. Reagan."
  },
  {
    id: "m4",
    movieTitle: "The Matrix",
    genre: "Sci-Fi",
    characterA: "Trinity",
    characterB: "Neo",
    prompt: "Please, Neo. You have to listen to me.",
    response: "Why? What is happening?"
  },

  // Space Opera / Sci-Fi
  {
    id: "s1",
    movieTitle: "Star Wars",
    genre: "Sci-Fi",
    characterA: "Luke Skywalker",
    characterB: "Obi-Wan Kenobi",
    prompt: "What is the Force?",
    response: "It's an energy field created by all living things. It surrounds us and penetrates us."
  },
  {
    id: "s2",
    movieTitle: "Star Wars",
    genre: "Sci-Fi",
    characterA: "Darth Vader",
    characterB: "Luke Skywalker",
    prompt: "Obi-Wan never told you what happened to your father.",
    response: "He told me enough! He told me you killed him!"
  },
  {
    id: "s3",
    movieTitle: "Star Wars",
    genre: "Sci-Fi",
    characterA: "Luke Skywalker",
    characterB: "Darth Vader",
    prompt: "No, I am your father.",
    response: "No... No! That's not true! That's impossible!"
  },
  {
    id: "s4",
    movieTitle: "Star Wars",
    genre: "Sci-Fi",
    characterA: "Princess Leia",
    characterB: "Han Solo",
    prompt: "I love you.",
    response: "I know."
  },
  {
    id: "s5",
    movieTitle: "Star Wars",
    genre: "Sci-Fi",
    characterA: "Luke Skywalker",
    characterB: "Yoda",
    prompt: "I don't believe it.",
    response: "That is why you fail."
  },

  // Romance / Classical Drama
  {
    id: "r1",
    movieTitle: "Casablanca",
    genre: "Romance",
    characterA: "Ilsa Lund",
    characterB: "Rick Blaine",
    prompt: "Of all the gin joints in all the towns in all the world, she walks into mine.",
    response: "I never should have let you go, Rick."
  },
  {
    id: "r2",
    movieTitle: "Casablanca",
    genre: "Romance",
    characterA: "Rick Blaine",
    characterB: "Ilsa Lund",
    prompt: "Here's looking at you, kid.",
    response: "Play it, Sam. Play 'As Time Goes By'."
  },
  {
    id: "r3",
    movieTitle: "Casablanca",
    genre: "Romance",
    characterA: "Rick Blaine",
    characterB: "Captain Renault",
    prompt: "Louis, I think this is the beginning of a beautiful friendship.",
    response: "That is the finest sentiment you've expressed yet."
  },
  {
    id: "t1",
    movieTitle: "Titanic",
    genre: "Romance",
    characterA: "Rose DeWitt Bukater",
    characterB: "Jack Dawson",
    prompt: "I'm flying, Jack!",
    response: "You are as beautiful as the day we met."
  },
  {
    id: "t2",
    movieTitle: "Titanic",
    genre: "Romance",
    characterA: "Jack Dawson",
    characterB: "Rose DeWitt Bukater",
    prompt: "Where to, Miss?",
    response: "To the stars."
  },
  {
    id: "t3",
    movieTitle: "Titanic",
    genre: "Romance",
    characterA: "Rose DeWitt Bukater",
    characterB: "Jack Dawson",
    prompt: "You jump, I jump, remember?",
    response: "I can't let you do this, Rose. Go back to the boat."
  },

  // Drama / Inspirational
  {
    id: "d1",
    movieTitle: "Good Will Hunting",
    genre: "Drama",
    characterA: "Will Hunting",
    characterB: "Sean Maguire",
    prompt: "It's not your fault.",
    response: "Don't mess with me, Sean. Not you."
  },
  {
    id: "d2",
    movieTitle: "Good Will Hunting",
    genre: "Drama",
    characterA: "Sean Maguire",
    characterB: "Will Hunting",
    prompt: "Do you have a soulmate?",
    response: "Someone that challenges you? Someone who opens up doors for you?"
  },
  {
    id: "d3",
    movieTitle: "Forrest Gump",
    genre: "Drama",
    characterA: "Forrest Gump",
    characterB: "My Mama",
    prompt: "Mama always said life was like a box of chocolates.",
    response: "You never know what you're gonna get."
  },
  {
    id: "d4",
    movieTitle: "Forrest Gump",
    genre: "Drama",
    characterA: "Jenny Curran",
    characterB: "Forrest Gump",
    prompt: "Why are you so good to me, Forrest?",
    response: "Because you are my girl, Jenny."
  },

  // Noir / Crime / Thriller
  {
    id: "c1",
    movieTitle: "Pulp Fiction",
    genre: "Crime",
    characterA: "Vincent Vega",
    characterB: "Jules Winnfield",
    prompt: "You know what they call a Quarter Pounder with Cheese in Paris?",
    response: "They don't call it a Quarter Pounder with Cheese?"
  },
  {
    id: "c2",
    movieTitle: "Pulp Fiction",
    genre: "Crime",
    characterA: "Jules Winnfield",
    characterB: "Vincent Vega",
    prompt: "What do they call it?",
    response: "They call it a Royale with Cheese."
  },
  {
    id: "c3",
    movieTitle: "Pulp Fiction",
    genre: "Crime",
    characterA: "Vincent Vega",
    characterB: "Mia Wallace",
    prompt: "I want to dance. I want to win that trophy.",
    response: "Then let's get out there on that floor."
  },
  {
    id: "th1",
    movieTitle: "The Silence of the Lambs",
    genre: "Thriller",
    characterA: "Hannibal Lecter",
    characterB: "Clarice Starling",
    prompt: "Well, Clarice. Have the lambs stopped screaming?",
    response: "I don't know. I don't think they ever will."
  },
  {
    id: "th2",
    movieTitle: "The Silence of the Lambs",
    genre: "Thriller",
    characterA: "Clarice Starling",
    characterB: "Hannibal Lecter",
    prompt: "What does he do, this man you think we're looking for?",
    response: "He covets, Clarice. He covets what he sees every single day."
  },

  // General helpful responses
  {
    id: "g1",
    movieTitle: "General Dialogue",
    genre: "General",
    characterA: "User",
    characterB: "Bot",
    prompt: "Hello",
    response: "Hello there! I am trained on the Cornell Movie Dialogs Corpus. How can I help you today?"
  },
  {
    id: "g2",
    movieTitle: "General Dialogue",
    genre: "General",
    characterA: "User",
    characterB: "Bot",
    prompt: "How are you?",
    response: "I'm doing well, contemplating some classic movie quotes. What is your favorite film?"
  },
  {
    id: "g3",
    movieTitle: "General Dialogue",
    genre: "General",
    characterA: "User",
    characterB: "Bot",
    prompt: "Who are you?",
    response: "I'm a movie dialogue chatbot mimicking python's ChatterBot logic adapters with POS tagging."
  },
  {
    id: "g4",
    movieTitle: "General Dialogue",
    genre: "General",
    characterA: "User",
    characterB: "Bot",
    prompt: "Goodbye",
    response: "Farewell! As they say in the movies, 'We'll always have Paris.'"
  },
  {
    id: "g5",
    movieTitle: "General Dialogue",
    genre: "General",
    characterA: "User",
    characterB: "Bot",
    prompt: "What is your purpose?",
    response: "To explore natural language processing pipelines and find matches in cinema history!"
  }
];
