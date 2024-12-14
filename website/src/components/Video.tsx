export default function Video({ src, width }) {
  return (
    <video
      height={"auto"}
      width={width}
      muted
      autoPlay
      className={"ring-2 ring-black rounded drop-shadow-lg"}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}
