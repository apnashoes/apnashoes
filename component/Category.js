import Image from "next/image";
import Link from "next/link";

const Category = () => {
  return (
    <>
      {/* CATEGORIES */}
      <section className="px-10 py-12">
        <h2 className="text-center text-4xl font-bold mb-10">
          SHOP BY CATEGORIES
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {[
            {
              name: "Sneakers",
              img: "/category/sneaker.png",
              link: "/category/sneakers",
            },
            {
              name: "Sports Shoes",
              img: "/category/sports.png",
              link: "/category/sports",
            },
            {
              name: "Formal Shoes",
              img: "/category/formal.png",
              link: "/category/formal",
            },
            {
              name: "Sandals",
              img: "/category/sandals.png",
              link: "/category/sandals",
            },
            {
              name: "Skechers",
              img: "/category/skecher.png",
              link: "/category/skechers",
            },
            {
              name: "Slipper",
              img: "/category/slipper.png",
              link: "/category/slippers",
            },
            {
              name: "Nike Shoes",
              img: "/category/nike.png",
              link: "/category/nike",
            },
            {
              name: "Sandals",
              img: "/category/sandals.png",
              link: "/category/sandals",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex border p-4 rounded text-center hover:shadow-lg transition"
            >
              <Image
                src={item.img}
                width={200}
                height={100}
                alt={item.name}
                className="mx-auto"
              />
              <div className="flex flex-col items-center">
                <h3 className="mt-4 font-semibold">{item.name}</h3>
                <Link href={item.link} className="block relative group">
                  <p className="text-yellow-500 text-sm mt-2 cursor-pointer">
                    Explore Now →
                  </p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
};

export default Category;
