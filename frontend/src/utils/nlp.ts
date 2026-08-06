/**
 * Natural Language Processing (Text to Gloss) for ISL
 */

const STOP_WORDS = new Set([
  'A', 'AN', 'THE', 'AM', 'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING', 'TO', 'DO', 'DOES', 'DID'
]);

const PRONOUNS = new Set([
  'I', 'WE', 'HE', 'SHE', 'THEY', 'IT', 'YOU', 'MY', 'YOUR', 'HIS', 'HER', 'OUR', 'THEIR'
]);

const VERB_ROOTS: Record<string, string> = {
  'EATING': 'EAT',
  'ATE': 'EAT',
  'EATS': 'EAT',
  'GOING': 'GO',
  'WENT': 'GO',
  'GOES': 'GO',
  'PLAYING': 'PLAY',
  'PLAYED': 'PLAY',
  'PLAYS': 'PLAY',
  'LIKING': 'LIKE',
  'LIKED': 'LIKE',
  'LIKES': 'LIKE',
  'WANTING': 'WANT',
  'WANTED': 'WANT',
  'WANTS': 'WANT',
  'RUNNING': 'RUN',
  'RAN': 'RUN',
  'RUNS': 'RUN',
  'SEEING': 'SEE',
  'SAW': 'SEE',
  'SEES': 'SEE'
};

export const englishToISLGloss = (sentence: string): string[] => {
  // 1. Normalize: Uppercase and strip punctuation
  const cleanSentence = sentence.toUpperCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
  
  // 2. Tokenize
  let tokens = cleanSentence.split(/\s+/).filter(Boolean);

  // 3. Remove stop words (articles and auxiliary verbs)
  tokens = tokens.filter(token => !STOP_WORDS.has(token));

  // 4. Map to root words
  tokens = tokens.map(token => VERB_ROOTS[token] || token);

  // 5. Basic SVO to SOV conversion (Subject-Object-Verb)
  // This is a simplified structural heuristic for demonstration.
  if (tokens.length >= 3) {
    const subject = tokens[0];
    if (PRONOUNS.has(subject)) {
      const potentialVerb = tokens[1];
      if (Object.values(VERB_ROOTS).includes(potentialVerb) || 
         ['EAT', 'GO', 'PLAY', 'LIKE', 'WANT', 'RUN', 'SEE'].includes(potentialVerb)) {
        
        // S V O -> S O V
        const verb = tokens.splice(1, 1)[0]; // Remove verb
        tokens.push(verb); // Put it at the end
      }
    }
  }

  return tokens;
};
