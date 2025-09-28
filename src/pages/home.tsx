import Layout from "../layouts/Layout";
import Button from "../components/Button";
import logo128 from "../assets/logo-128x128.png";
import heroPicture from "../assets/hero-picture.png";

function Home() {
  return (
    <Layout>
      <div className="p-16 flex items-center justify-between gap-16">
        <div className="flex-1 max-w-2xl">
          <div className="flex items-center mb-4">
            <img
              src={logo128}
              alt="CraveBuddy Logo"
              className="w-16 h-16 mr-8"
            />
            <h2 className="font-bold text-gray-800">CraveBuddy</h2>
          </div>

          <h4 className="text-4xl font-bold leading-tight mb-8 text-gray-800">
            Smart swaps. Simple meal plans. Real progress.
          </h4>

          <h6 className="mb-8 text-gray-800">
            Turn any recipe into a healthy, easy-to-follow meal plan:
            auto-generated grocery lists, per-serving nutrition estimates, and
            smart ingredient swaps that cut calories without sacrificing taste.
          </h6>

          <div className="flex gap-4">
            <Button
              variant="large"
              title="Get started"
              className="bg-primary text-neutral-50 text-base hover:bg-green-500"
            />
            <Button
              variant="large"
              title="Demo"
              className="bg-neutral-400 text-neutral-50 hover:bg-neutral-500"
            />
          </div>
        </div>

        <img
          src={heroPicture}
          alt="CraveBuddy Hero"
          className="max-w-full max-h-[768px] h-auto rounded-xl"
        />
      </div>
    </Layout>
  );
}

export default Home;
