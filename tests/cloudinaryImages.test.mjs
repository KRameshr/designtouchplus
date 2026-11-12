import test from "node:test";
import assert from "node:assert/strict";
import { cloudinaryImageUrl, cloudinaryResponsiveImageProps } from "../lib/cloudinaryImages.mjs";

const original = "https://res.cloudinary.com/demo/image/upload/v12345/design/campaign.png";

test("Cloudinary URLs receive width-limited automatic format and quality transformations", () => {
  assert.equal(
    cloudinaryImageUrl(original, 640),
    "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640,c_limit/v12345/design/campaign.png",
  );
});

test("responsive props use srcset widths and preserve the source aspect ratio", () => {
  const props = cloudinaryResponsiveImageProps(original, {
    widths: [320, 640, 960],
    sizes: "(min-width: 768px) 50vw, 100vw",
    fallbackWidth: 640,
  });

  assert.equal(props.src, cloudinaryImageUrl(original, 640));
  assert.equal(props.sizes, "(min-width: 768px) 50vw, 100vw");
  assert.match(props.srcSet, /w_320,c_limit\/v12345\/design\/campaign\.png 320w/);
  assert.match(props.srcSet, /w_960,c_limit\/v12345\/design\/campaign\.png 960w/);
});

test("non-Cloudinary, signed, and already-transformed URLs remain unchanged", () => {
  const signed = `${original}?signature=private`;
  const pathSigned = "https://res.cloudinary.com/demo/image/upload/v12345/s--opaque-signature--/design/campaign.png";
  const transformed = "https://res.cloudinary.com/demo/image/upload/c_fill,w_640/v12345/design/campaign.png";

  assert.equal(cloudinaryImageUrl("https://cdn.example.test/image.png", 640), "https://cdn.example.test/image.png");
  assert.equal(cloudinaryImageUrl(signed, 640), signed);
  assert.equal(cloudinaryImageUrl(pathSigned, 640), pathSigned);
  assert.equal(cloudinaryImageUrl(transformed, 320), transformed);
  assert.deepEqual(cloudinaryResponsiveImageProps("/local/image.png"), { src: "/local/image.png" });
});

test("invalid widths cannot construct a Cloudinary transformation", () => {
  assert.equal(cloudinaryImageUrl(original, 0), original);
  assert.equal(cloudinaryImageUrl(original, 5001), original);
  assert.equal(cloudinaryImageUrl(original, 640.5), original);
});
