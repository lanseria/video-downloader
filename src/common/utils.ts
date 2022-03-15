import { intersection, keys, pick } from "lodash-es";

/**
 * 覆盖对象属性
 * @param distObject 初始化对象
 * @param srcObject 传递过来新对象
 */
export function mergeProperties<T>(distObject: T, srcObject: IObj) {
  const distPropList = keys(distObject);
  const srcPropList = keys(srcObject);
  const propList = intersection(distPropList, srcPropList);
  return {
    ...distObject,
    ...pick(srcObject, propList),
  };
}

/**
 * Serialize an object to a string
 * @param value - The value to be serialized.
 * @returns The serialized object.
 */
export const serialize = (value) => {
  if (typeof value === "function") {
    return value.toString();
  }
  if (typeof value === "object") {
    var serializeObject = {};
    for (const [objectKey, objectValue] of Object.entries(value)) {
      serializeObject[objectKey] = serialize(objectValue);
    }
    return serializeObject;
  }

  return value;
};

/**
 * Deserialize a string that represents a function or an object
 * @param valueNew - The value to be deserialized.
 * @returns The deserialized object.
 */
export function deserialize(valueNew) {
  if (valueNew.toLowerCase().startsWith("function(")) {
    return Function('"use strict";return ' + valueNew);
  }
  if (typeof valueNew === "object") {
    var deserializeObject = {};
    for (const [objectKey, objectValue] of Object.entries(valueNew)) {
      deserializeObject[objectKey] = deserialize(objectValue);
    }
    return deserializeObject;
  }

  return valueNew;
}

/**
 * Convert a number of seconds into an SRT timestamp
 * @param {number} seconds - The number of seconds to convert to an SRT timestamp.
 * @returns a string that is formatted as a SRT timestamp.
 */
export function srtTimestamp(seconds: number) {
  let $milliseconds = seconds + 0;

  let $seconds = Math.floor($milliseconds / 1000);
  let $minutes = Math.floor($seconds / 60);
  const $hours = Math.floor($minutes / 60);
  $milliseconds = $milliseconds % 1000;
  $seconds = $seconds % 60;
  $minutes = $minutes % 60;
  return (
    ($hours < 10 ? "0" : "") +
    $hours +
    ":" +
    ($minutes < 10 ? "0" : "") +
    $minutes +
    ":" +
    ($seconds < 10 ? "0" : "") +
    $seconds +
    "," +
    ($milliseconds < 100 ? "0" : "") +
    ($milliseconds < 10 ? "0" : "") +
    $milliseconds
  );
}
/**
 * Create a subtitle text string from the given parameters
 * @param {number} index - The index of the subtitle.
 * @param {number} startTime - The start time of the subtitle in milliseconds.
 * @param {number} endTime - The end time of the subtitle.
 * @param {string} text - The text of the subtitle.
 * @param [isLast=false] - boolean
 * @returns A string that represents a subtitle in the srt format.
 */

export function makeSubtitleText(
  index: number,
  startTime: number,
  endTime: number,
  text: string,
  isLast = false
) {
  if (isLast) {
    return `${index}
${srtTimestamp(startTime)} --> ${srtTimestamp(endTime)}
${text}
`;
  }
  const lineStr = `${index}
${srtTimestamp(startTime)} --> ${srtTimestamp(endTime)}
${text}

`;
  return lineStr;
}

/**
 * It takes in an array of subtitles and returns a string of the srt file.
 * @param {SubtitlesItem[]} subtitles - The subtitles to be converted to SRT.
 * @returns a string that is the concatenation of the lines of the subtitles.
 */
export function buildFile(subtitles: SubtitlesItem[]) {
  let index = 0;
  let srtText = "";
  subtitles.forEach((m, i) => {
    const lineStr = makeSubtitleText(
      index,
      m.StartMs,
      m.EndMs,
      m.FinalSentence,
      i + 1 === subtitles.length
    );
    srtText += lineStr;
    index++;
  });
  return srtText;
}

/**
 * Convert a string of SRT formatted subtitles to WebVTT format
 * @param {string} data - The subtitle file contents.
 * @returns a string.
 */
export function srt2webvtt(data: string) {
  // remove dos newlines
  var srt = data.replace(/\r+/g, "");
  // trim white space start and end
  srt = srt.replace(/^\s+|\s+$/g, "");

  // get cues
  var cuelist = srt.split("\n\n");
  var result = "";

  if (cuelist.length > 0) {
    result += "WEBVTT\n\n";
    for (var i = 0; i < cuelist.length; i = i + 1) {
      result += convertSrtCue(cuelist[i]);
    }
  }
  return result;
}
/**
 * Convert a single SRT caption into a single cue
 * @param {string} caption - The caption file to convert.
 * @returns a string.
 */

function convertSrtCue(caption: string) {
  // remove all html tags for security reasons
  //srt = srt.replace(/<[a-zA-Z\/][^>]*>/g, '');

  var cue = "";
  var s = caption.split(/\n/);

  // concatenate muilt-line string separated in array into one
  while (s.length > 3) {
    for (var i = 3; i < s.length; i++) {
      s[2] += "\n" + s[i];
    }
    s.splice(3, s.length - 3);
  }

  var line = 0;

  // detect identifier
  if (!s[0].match(/\d+:\d+:\d+/) && s[1].match(/\d+:\d+:\d+/)) {
    cue += s[0].match(/\w+/) + "\n";
    line += 1;
  }

  // get time strings
  if (s[line].match(/\d+:\d+:\d+/)) {
    // convert time string
    var m = s[1].match(
      /(\d+):(\d+):(\d+)(?:,(\d+))?\s*--?>\s*(\d+):(\d+):(\d+)(?:,(\d+))?/
    );
    if (m) {
      cue +=
        m[1] +
        ":" +
        m[2] +
        ":" +
        m[3] +
        "." +
        m[4] +
        " --> " +
        m[5] +
        ":" +
        m[6] +
        ":" +
        m[7] +
        "." +
        m[8] +
        "\n";
      line += 1;
    } else {
      // Unrecognized timestring
      return "";
    }
  } else {
    // file format error or comment lines
    return "";
  }

  // get cue text
  if (s[line]) {
    cue += s[line] + "\n\n";
  }

  return cue;
}
