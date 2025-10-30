import Layout from "../layouts/Layout";
import logo128 from "../assets/logo-128x128.png";
import heroPicture from "../assets/hero-picture.png";
import groceries from "../assets/groceries.jpg";
import preparation from "../assets/preparation.jpg";
import smartSwaps from "../assets/smart-swap.png";
import howItWorks from "../assets/how-it-works.gif";
import { Button } from "@/components/ui/button";
import { useViewTransition } from "@/hooks/use-view-transition";
import snipRegister from "../assets/snip-register.png";
import snipNutriInfo from "../assets/snip-nutri-info.png";
import snipMealGeneration from "../assets/snip-meal-generation.png";
import snipCooking from "../assets/snip-cooking.png";

function HeroSection() {
  const navigate = useViewTransition();

  return (
    <section
      id="home"
      className="pt-16 pb-8 px-16 flex items-center justify-between gap-16"
    >
      <div className="flex-1 max-w-2xl">
        <div className="flex items-center mb-4">
          <img src={logo128} alt="CraveBuddy Logo" className="w-16 h-16 mr-8" />
          <h2 className="font-bold text-gray-800">CraveBuddy</h2>
        </div>

        <h4 className="text-4xl font-bold leading-tight mb-8 text-gray-800">
          Smart swaps. Simple meal plans. Real progress.
        </h4>

        <h6 className="mb-8 text-gray-700">
          Turn any recipe into a healthy, easy-to-follow meal plan:
          auto-generated grocery lists, per-serving nutrition estimates, and
          smart ingredient swaps that cut calories without sacrificing taste.
        </h6>

        <div className="flex gap-4">
          <Button
            size="lg"
            variant="default"
            onClick={() => navigate("/create-recipe")}
          >
            <h6>Get started</h6>
          </Button>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate("/create-recipe")}
          >
            <h6>Demo</h6>
          </Button>
        </div>
      </div>

      <img
        src={heroPicture}
        alt="CraveBuddy Hero"
        className="max-w-full max-h-[768px] h-auto rounded-xl"
      />
    </section>
  );
}

function Features() {
  const navigate = useViewTransition();

  const features = [
    {
      title: "Auto-generated grocery list",
      picture: groceries,
    },
    {
      title: "Smart swaps for less calories",
      picture: smartSwaps,
    },
    {
      title: "Cook with timers & voice",
      picture: preparation,
    },
  ];
  return (
    <section
      id="features"
      className="flex flex-col items-center gap-8 py-8 px-16 h-screen"
    >
      <div className="text-center">
        <h3 className="mb-4">Meal preparation made simple.</h3>
        <h5 className="max-w-2xl text-center text-gray-800">
          AI suggests a lighter take on your meal and shows how it stacks up
          against the classic.
        </h5>
      </div>
      <div className="flex flex-row gap-8 2xl:gap-16 h-full items-center">
        {features.map((feature) => (
          <div key={feature.title} className="w-48 lg:w-64 2xl:w-96">
            <img
              src={feature.picture}
              alt={feature.title}
              className="mx-auto mb-4 rounded-lg h-48 lg:h-64 2xl:h-96 aspect-video object-cover"
            />
            <h5 className="font-semibold text-center text-gray-800">
              {feature.title}
            </h5>
          </div>
        ))}
      </div>
      <Button
        variant="default"
        onClick={() => navigate("/create-recipe")}
        size="lg"
      >
        <h6>Get started</h6>
      </Button>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="about"
      className="flex flex-col items-center gap-8 py-8 px-16 min-h-screen"
    >
      <h3>How it works?</h3>
      <h5 className="max-w-3xl text-center text-gray-800">
        CraveBuddy leverages the power of Chrome’s built-in AI API’s. All your
        cravings remain private.
      </h5>
      <div className="flex flex-col gap-8 items-center h-full w-full">
        <img
          src={howItWorks}
          alt="How it works"
          className="rounded-lg max-h-96"
        />
        <div className="flex gap-4 h-full">
          <div>
            <h5>1. Tell us about yourself</h5>
            <img
              src={snipRegister}
              alt="register screenshot"
              className="w-full object-fit"
            />
          </div>
          <div>
            <h5>2. Find out your needs</h5>
            <img
              src={snipNutriInfo}
              alt="nutritional information screenshot"
              className="w-full object-fit"
            />
          </div>
          <div>
            <h5>3. Generate healthier recipes</h5>
            <img
              src={snipMealGeneration}
              alt="meal generation screenshot"
              className="w-full  object-fit"
            />
          </div>
          <div>
            <h5>4. Build a weekly plan</h5>
            <img
              src={snipCooking}
              alt="cooking screenshot"
              className="w-full  object-fit"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Home() {
  return (
    <Layout>
      <HeroSection />
      <Features />
      <HowItWorks />
    </Layout>
  );
}

export default Home;
