var t = "One night--it was on the twentieth of March, 1888--I was returning from a journey to a patient (for I had now returned to civil practice), when my way led me through Baker Street. As I passed the well-remembered door, which must always be associated in my mind with my wooing, and with the dark incidents of the Study in Scarlet, I was seized with a keen desire to see Holmes again, and to know how he was employing his extraordinary powers. His rooms were brilliantly lit, and, even as I looked up, I saw his tall, spare figure pass twice in a dark silhouette against the blind. He was pacing the room swiftly, eagerly, with his head sunk upon his chest and his hands clasped behind him. To me, who knew his every mood and habit, his attitude and manner told their own story. He was at work again. He had risen out of his drug-created dreams and was hot upon the scent of some new problem. I rang the bell and was shown up to the chamber which had formerly been in part my own.";

var NWORDS = train(words(t)),
    alphabet = 'abcdefghijklmnopqrstuvwxyz'.split("");

function words (text) { return text.toLowerCase().match(/[a-z]+/g); }

function train (features) {
  return features.reduce(function (model, word) {
    model[word] = model[word] ? model[word] + 1 : 1; // off by one; what about undefined keys?
    return model;
  }, {});
}

function edits1 (word) {
  var splits = range(word.length + 1).map(function (i) { return [word.substring(0, i), word.substring(i)]; }),
      deletes = splits.map(function (split) { var a = split[0], b = split[1]; return a + b.slice(1); }),
      transposes = splits.map(function (split) { var a = split[0], b = split[1]; return b.length > 1 ? a + b[1] + b[0] + b.slice(2) : ""; }),
      replaces = splits.reduce(function (acc, split) {
        var a = split[0], b = split[1];
        return acc.concat(alphabet.map(function (c) { return b ? a + c + b.slice(1) : ""; }))
      }, []),
      inserts = splits.reduce(function (acc, split) {
        var a = split[0], b = split[1];
        return acc.concat(alphabet.map(function (c) { return a + c + b; }))
      }, []);
  return set(deletes.concat(transposes, replaces, inserts));
}

function known_edits2 (word) {
  var edits = [];
  edits1(word).forEach(function (e1) {
    edits1(e1).forEach(function (e2) {
      if (e2 in NWORDS)
        edits.push(e2);
    })});
  return set(edits);
}

function known (words) {
  return set(words.reduce(function (acc, w) { if (w in NWORDS) acc.push(w); return acc;}, []));
}

function correct (word) {
  var candidates = known([word]) || known(edits1(word)) || known_edits2(word) || [word]
  return max(candidates);
}

function max (candidates) {
  var maxVal = 0, maxKey, i;
  for (i = 0; i < candidates.length; i++)
    if (NWORDS[candidates[i]] > maxVal) {
      maxVal = NWORDS[candidates[i]];
      maxKey = candidates[i];
    }
  return maxKey;
}

function range (n) {
  for (var i = 0, r = []; i < n; i++)
     r.push(i);
  return r;
}

function set (list) { // Warning: Returns null and not [] for empty sets!
  var s = Object.keys(list.reduce(function (o, k)  {if (k) o[k] = 0; return o;}, {}));
  return s.length ? s : null; // Hack to get around [] being truth-y
}
