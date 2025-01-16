import { http, HttpResponse } from "msw";

const markersMock = [
  {
    lat: 37.50343486188408,
    lng: 126.76489640827259,
  },
  {
    lat: 37.50537866578709,
    lng: 126.75325462760614,
  },
  {
    lat: 37.49676023941456,
    lng: 126.76466460307014,
  },
  {
    lat: 37.49845799240683,
    lng: 126.76760129889759,
  },
  {
    lat: 37.504623855095964,
    lng: 126.75539539380814,
  },
  {
    lat: 37.50970076283075,
    lng: 126.75789331298813,
  },
  {
    lat: 37.50242855624744,
    lng: 126.76141924703349,
  },
  {
    lat: 37.51198845243579,
    lng: 126.76071520271577,
  },
  {
    lat: 37.493791622799876,
    lng: 126.75611404638707,
  },
  {
    lat: 37.49834871869176,
    lng: 126.76186362563318,
  },
  {
    lat: 37.501117591854694,
    lng: 126.76700315922956,
  },
  {
    lat: 37.50466854704135,
    lng: 126.76692565032413,
  },
  {
    lat: 37.50136860269438,
    lng: 126.75320663080967,
  },
  {
    lat: 37.50937413930037,
    lng: 126.7617076253257,
  },
  {
    lat: 37.49876379593432,
    lng: 126.7587649993566,
  },
  {
    lat: 37.49802330142137,
    lng: 126.75283816802265,
  },
  {
    lat: 37.49325387650024,
    lng: 126.76376358849824,
  },
  {
    lat: 37.49591115925145,
    lng: 126.76059693981618,
  },
  {
    lat: 37.51176290519465,
    lng: 126.75098251404141,
  },
  {
    lat: 37.50474574749717,
    lng: 126.76036389252224,
  },
  {
    lat: 37.51146062472002,
    lng: 126.7559303368054,
  },
  {
    lat: 37.504985732015086,
    lng: 126.76470804244194,
  },
  {
    lat: 37.5089545804688,
    lng: 126.76868831945643,
  },
  {
    lat: 37.512583485118824,
    lng: 126.76025814314947,
  },
  {
    lat: 37.50560998085912,
    lng: 126.75098133220793,
  },
  {
    lat: 37.495867337889955,
    lng: 126.76113090598507,
  },
  {
    lat: 37.494619963318726,
    lng: 126.7702962282553,
  },
  {
    lat: 37.511357918670676,
    lng: 126.7555757400144,
  },
  {
    lat: 37.50314310476724,
    lng: 126.75882610216483,
  },
  {
    lat: 37.51061747403979,
    lng: 126.76499778486121,
  },
];

export const getPostsList = http.get(`${BASE_URL}/posts/list`, () => {
  return HttpResponse.json(
    markersMock.map((v, index) => ({
      postId: Math.floor(Math.random() * 100),
      title: `[${index}]` + "블로그 제목",
      ogText:
        `[${index}]` +
        "**Version 1:**\n\n**Morning in the Heart of Africa**\n\nAs the golden rays of dawn kissed the equatorial land at 6:30 AM, I found myself immersed in the vibrant heart of Africa. Latitude 10 and longitude 30 marked my location, where the rhythmic beat of life pulsated with every breath.\n\nI embarked on a guided safari, scanning the vast expanse for elusive wildlife. With each step, my senses were tantalized by the symphony of nature. The roar of lions echoed through the dense jungle, while the gentle flutter of birds painted the sky in hues of emerald and azure.\n\n**Version 2:**\n\n**An Encounter in the African Savannah**\n\nAt the break of dawn, I ventured deep into the untamed African savannah at 6:30 AM. Latitude 10 and longitude 30 served as my compass, leading me towards a realm of wonder.\n\nAtop an open-air jeep, I witnessed the majestic dance of wildlife. Elephants lumbered through the golden grass, their trumpeting calls resonating across the plains. Zebras galloped with breathtaking grace, their striped patterns shimmering in the morning light.\n\n**Version 3:**\n\n**A Day in Africa's Tropical Paradise**\n\nWith the sun casting a golden glow upon the lush landscape, I set out on an adventure at 6:30 AM, guided by the coordinates of latitude 10 and longitude 30. I found myself in a tropical paradise, brimming with vibrant life.\n\nAs I strolled through the rainforest, the air was heavy with the sweet scent of exotic flowers. Monkeys swung effortlessly through the trees, while vibrant birdsong filled the air with a cacophony of melodies. I couldn't help but feel a sense of awe and gratitude to have witnessed such natural beauty.",
      aiGenText:
        `[${index}]\n` +
        "**Version 1:**\n\n**Morning in the Heart of Africa**\n\nAs the golden rays of dawn kissed the equatorial land at 6:30 AM, I found myself immersed in the vibrant heart of Africa. Latitude 10 and longitude 30 marked my location, where the rhythmic beat of life pulsated with every breath.\n\nI embarked on a guided safari, scanning the vast expanse for elusive wildlife. With each step, my senses were tantalized by the symphony of nature. The roar of lions echoed through the dense jungle, while the gentle flutter of birds painted the sky in hues of emerald and azure.\n\n**Version 2:**\n\n**An Encounter in the African Savannah**\n\nAt the break of dawn, I ventured deep into the untamed African savannah at 6:30 AM. Latitude 10 and longitude 30 served as my compass, leading me towards a realm of wonder.\n\nAtop an open-air jeep, I witnessed the majestic dance of wildlife. Elephants lumbered through the golden grass, their trumpeting calls resonating across the plains. Zebras galloped with breathtaking grace, their striped patterns shimmering in the morning light.\n\n**Version 3:**\n\n**A Day in Africa's Tropical Paradise**\n\nWith the sun casting a golden glow upon the lush landscape, I set out on an adventure at 6:30 AM, guided by the coordinates of latitude 10 and longitude 30. I found myself in a tropical paradise, brimming with vibrant life.\n\nAs I strolled through the rainforest, the air was heavy with the sweet scent of exotic flowers. Monkeys swung effortlessly through the trees, while vibrant birdsong filled the air with a cacophony of melodies. I couldn't help but feel a sense of awe and gratitude to have witnessed such natural beauty.",
      password:
        "5906ac361a137e2d286465cd6588ebb5ac3f5ae955001100bc41577c3d751764",
      rgstDtm: "2025-01-05 10:26:27",
      chngDtm: null,
      thumbHash: {
        thumbGeoLong: v.lng.toString(),
        thumbImgPath: "/image1.jpeg",
        thumbImgId: "1",
        thumbGeoLat: v.lat.toString(),
      },
    })),
  );
});
