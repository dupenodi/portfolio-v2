import Image from "next/image";
import { site } from "@/lib/site";

export function BuyMeAChai() {
  return (
    <a
      className="buy-chai"
      href={site.buyMeAChai}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Image
        src={site.buyMeAChaiImage}
        alt="Buy Me A Chai"
        width={200}
        height={56}
      />
    </a>
  );
}
