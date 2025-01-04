export default function Card() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-[310px] w-full rounded-xl bg-yellow-300">image</div>
      <div>
        <h3 className="text-white-primary text-[14px] font-medium">
          Blog post title goes here
        </h3>
        <p className="line-clamp-2 text-[14px] text-[#717375]">
          Lorem ipsum dolor sit amet consectetur. Ornare nullam tincidunt diam
          id nisi feugiat vivamus in. Nunc congue gravida cursus amet posuere
          nunc in sagittis a.
        </p>
      </div>
    </div>
  );
}
