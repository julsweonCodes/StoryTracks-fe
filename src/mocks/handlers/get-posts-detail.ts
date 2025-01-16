import { BASE_URL } from '../../config';
import { http, HttpResponse } from "msw";

export const getPostsDetail = http.get(`${BASE_URL}/posts/:post_id`, () => {
  return HttpResponse.json({
    postId: 1,
    title: "블로그 제목12",
    ogText: "가나다다ㅏㄹ아아ㅏ아라라미랑ㄹ12",
    aiGenText:
      "**Version 1:**\n\n**Morning in the Heart of Africa**\n\nAs the golden rays of dawn kissed the equatorial land at 6:30 AM, I found myself immersed in the vibrant heart of Africa. Latitude 10 and longitude 30 marked my location, where the rhythmic beat of life pulsated with every breath.\n\nI embarked on a guided safari, scanning the vast expanse for elusive wildlife. With each step, my senses were tantalized by the symphony of nature. The roar of lions echoed through the dense jungle, while the gentle flutter of birds painted the sky in hues of emerald and azure.\n\n**Version 2:**\n\n**An Encounter in the African Savannah**\n\nAt the break of dawn, I ventured deep into the untamed African savannah at 6:30 AM. Latitude 10 and longitude 30 served as my compass, leading me towards a realm of wonder.\n\nAtop an open-air jeep, I witnessed the majestic dance of wildlife. Elephants lumbered through the golden grass, their trumpeting calls resonating across the plains. Zebras galloped with breathtaking grace, their striped patterns shimmering in the morning light.\n\n**Version 3:**\n\n**A Day in Africa's Tropical Paradise**\n\nWith the sun casting a golden glow upon the lush landscape, I set out on an adventure at 6:30 AM, guided by the coordinates of latitude 10 and longitude 30. I found myself in a tropical paradise, brimming with vibrant life.\n\nAs I strolled through the rainforest, the air was heavy with the sweet scent of exotic flowers. Monkeys swung effortlessly through the trees, while vibrant birdsong filled the air with a cacophony of melodies. I couldn't help but feel a sense of awe and gratitude to have witnessed such natural beauty.",
    password:
      "5906ac361a137e2d286465cd6588ebb5ac3f5ae955001100bc41577c3d751764",
    rgstDtm: "2025-01-05 10:26:27",
    chngDtm: null,
    blogImgList: [
      {
        imgId: 1,
        postId: 1,
        geoLat: "50.004998",
        geoLong: "126.100333",
        imgPath: "/image1.jpeg",
        imgDtm: "2025-01-05 10:31:44",
        rgstDtm: "2025-01-05 10:31:44",
        thumbYn: "Y",
      },
      {
        imgId: 2,
        postId: 1,
        geoLat: "50.004998",
        geoLong: "126.100333",
        imgPath: "/image2.jpeg",
        imgDtm: "2025-01-05 10:31:52",
        rgstDtm: "2025-01-05 10:31:52",
        thumbYn: "N",
      },
      {
        imgId: 3,
        postId: 1,
        geoLat: "50.004998",
        geoLong: "126.100333",
        imgPath: "/image3.jpeg",
        imgDtm: "2025-01-05 10:31:56",
        rgstDtm: "2025-01-05 10:31:56",
        thumbYn: "N",
      },
    ],
  });
});
