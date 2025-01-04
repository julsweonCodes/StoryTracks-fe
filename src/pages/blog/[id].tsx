import Image from "next/image";
import { FiMoreVertical } from "react-icons/fi";

export default function Detail() {
  const mockData = {
    title: "Notes from the Road: Everyday Travel Tales",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    image: [
      "https://s3-alpha-sig.figma.com/img/e9ab/d523/bf81ca143b40f1d9f91530fafc5a3496?Expires=1736726400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=KF8JpLgLhlq52g22dgiozaHL~kUuc04MJblG7xJm~hWOjPMEUZgR4Y6HdyGu0F~VswMW0iQvoAKkLrvDrq9zasrpp5IhpfnXYCjQ3H9Nqy7mRu-LRFuhNA49bV5J3IrSnnHs7N4upmL~i~~PAA1uRkvoyRKp-579xhyp1p8xPF8bvN18dsgmAK12YBITAiI0scuGA8pjWCgK2IH88eYdoQpcZqHxkDIA31dAWow0ihn3x~V1eC2RcJKHL9Da2zbzsm1-3mTZ7r-kjH8oOPJKHW4njpvNnfVQJm~E5ChSp1PiIWuIwKk7tv-9xeR33x36nRKVFwQCb014xDQWuW7Wyw__",
      "https://s3-alpha-sig.figma.com/img/3818/092a/9b22fd481524856607c9d311e72f21bf?Expires=1736726400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=gHahBaqkQrgeh02wsxLX00vUmzNZK6Z5k4MFaeDEzMl19PLXrPztBn7FbkTHcG1WvCeJmm74b4456UVtE8WX3Y5Kjc6285nfzmgs8LmNammxtnC0IRFTwrs5IQRtpoMsgla6XzubjiT2Ll3LqNTxE5ylzOu9Pf-hs~reaBicZ2H0~IvH8FVOlra3gGCVfqwAlsi-fwKe2odKucobzw2m523cjojTvejh9yYelDPOvxYdpmyT1mS2ppx1JNRHBeJrGtIRqIb06xRaSF0oNab7oIgZSFufsJoGXHfN3y14oqcvhpHyCw2m3eqa8JN1xgtOmi3raouSQY2RgRyEjnbJlA__",
      "https://s3-alpha-sig.figma.com/img/6f52/4c9d/dae7cf38f16b868246a577293f2fe4af?Expires=1736726400&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=bzRyCVGcSrca97Rfmf0Cb9YC3~AGS3~uYlQvH4~jNxg1rEEzXouFIf6clTkjTUJ-pIiNW2trQpCQo8DqSqRFxl1iYW5NYkE31M52I7nZDuagWbjJpDoFce-yhERkxlE-0oACxSxMVj8QWZ7Dcw~NSGEoZm7YD-zQdy-sNJPf7ZFFJv-kyQbM5eojX~MsHZ2CL6CM8aOHrwXscD5IWXDFnzAEIe95Wfoz1cTvjBS6nSF1TYUwRhElJuIVbwmXAdFiCX5-UtXMCXOm~DsBzlwzLbEzBLRbSWesVZfw8ZTKuvgE0fnSi7FEiWDHIxlhXpOuGpCMGuG9mF-VOKqzQlSXUQ__",
    ],
  };

  return (
    <div className="flex flex-col divide-y divide-black-tertiary overflow-y-auto p-4">
      <div className="flex flex-col gap-4 pb-4">
        <div>
          <span className="text-[13px] tracking-tight text-black-tertiary">
            Travel
          </span>
        </div>
        <h1 className="text-[32px] font-medium">{mockData.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[13px] tracking-tight text-[#E6E6E6]">
              John Doe
            </span>
            <span className="text-[12px] tracking-tight text-black-tertiary">
              2024.12.28. 13:08
            </span>
          </div>
          <div>
            <FiMoreVertical size={24} />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-5 pt-4">
        <div className="flex flex-col gap-3">
          {mockData.image.map((src, index) => (
            <Image
              key={index}
              src={src}
              alt="preview"
              className="aspect-square w-full object-cover"
            />
          ))}
        </div>
        <div>
          <p className="text-[16px] leading-6 tracking-tight">
            {mockData.description}
          </p>
        </div>
      </div>
    </div>
  );
}
