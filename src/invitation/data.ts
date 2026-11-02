// Single source of truth for the invitation: names, date, venue and the
// soundtrack. Change it here and every screen (lock screen, calendar, notes,
// Safari invitation, YouTube app) follows.

export const WEDDING = {
  bride: "Neha",
  groom: "Ekansh",
  names: "Ekansh & Neha",
  ceremony: "Wedding",
  dateLong: "Friday, 15 January 2027",
  dateShort: "15 January 2027",
  weekday: "Friday",
  day: "15",
  month: "January",
  time: "5:00 PM onwards",
  /** ISO date with the Delhi offset, used for add-to-calendar links. */
  startISO: "2027-01-15T17:00:00+05:30",
  endISO: "2027-01-15T22:00:00+05:30",
  venue: "The Grandeur by Lavanya",
  hall: "Banquet Hall",
  address:
    "A-15, Mahatma Gandhi Rd, Block A, Wazirpur Industrial Area, Ashok Vihar, Delhi, 110052",
  hosts: "Mr. Shyam Behari & Mrs. Deepmalika",
  hashtag: "#EkanshAndNeha",
  blessing: "With the blessings of Lord Ganesha",
} as const;

export const MAPS_URL =
  "https://www.google.com/maps/search/?api=1&query=The+Grandeur+by+Lavanya+banquet%2C+A-15%2C+Mahatma+Gandhi+Rd%2C+Wazirpur+Industrial+Area%2C+Ashok+Vihar%2C+Delhi+110052";

export const VENUE_MAP_EMBED =
  "https://maps.google.com/maps?q=The%20Grandeur%20by%20Lavanya%20banquet%2C%20Ashok%20Vihar%2C%20Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed";

/** A calendar download that works without any backend. */
export function googleCalendarUrl() {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `${WEDDING.names} · ${WEDDING.ceremony}`,
    dates: "20270115T113000Z/20270115T163000Z", // 5:00–10:00 PM IST
    details: `${WEDDING.blessing}. ${WEDDING.ceremony} of ${WEDDING.bride} and ${WEDDING.groom}.`,
    location: `${WEDDING.venue}, ${WEDDING.hall}, ${WEDDING.address}`,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export type Song = {
  /** YouTube video id. */
  id: string;
  title: string;
  artist: string;
  film: string;
  mood: string;
};

/**
 * The five songs from the couple's shared YouTube playlist. They are played
 * through the YouTube IFrame player, so nothing is re-hosted and the artists
 * keep their plays.
 */
export const PLAYLIST: Song[] = [
  {
    id: "boeim-VkxN4",
    title: "Aaj Sajeya",
    artist: "Goldie Sohel",
    film: "Aaj Sajeya",
    mood: "Bridal entry",
  },
  {
    id: "ElZfdU54Cp8",
    title: "Apna Bana Le",
    artist: "Arijit Singh · Sachin-Jigar",
    film: "Bhediya",
    mood: "Soft romantic",
  },
  {
    // Lyric video: the label's main upload blocks embedding.
    id: "ZtYtFxQvI20",
    title: "Kesariya",
    artist: "Arijit Singh · Pritam",
    film: "Brahmastra",
    mood: "Big feelings",
  },
  {
    id: "gIOea2pgfIo",
    title: "Tere Sang Yaara",
    artist: "Atif Aslam · Arko",
    film: "Rustom",
    mood: "Classic love",
  },
  {
    // Lyric video, embeddable where the film's main upload is not.
    id: "orYf6VDtj_k",
    title: "Raataan Lambiyan",
    artist: "Jubin Nautiyal · Asees Kaur · Tanishk Bagchi",
    film: "Shershaah",
    mood: "Soft romantic",
  },
];

export const ytThumb = (id: string, size: "hq" | "mq" | "sd" = "hq") =>
  `https://i.ytimg.com/vi/${id}/${size}default.jpg`;

export const ytWatchUrl = (id: string) =>
  `https://www.youtube.com/watch?v=${id}`;
