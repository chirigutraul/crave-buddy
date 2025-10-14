import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/User";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import BackgroundImage from "@/assets/background-image.jpeg";

type ActivityLevel =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

interface FormData {
  name: string;
  age: string;
  height: string;
  weight: string;
  sex: "male" | "female";
  activityLevel: ActivityLevel;
}

interface FormErrors {
  name?: string;
  age?: string;
  height?: string;
  weight?: string;
  sex?: string;
  activityLevel?: string;
}

function Register() {
  const navigate = useNavigate();
  const { createUser } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    height: "",
    weight: "",
    sex: "male",
    activityLevel: "moderate",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age)) {
      newErrors.age = "Age is required";
    } else if (age < 13 || age > 120) {
      newErrors.age = "Age must be between 13 and 120";
    }

    const height = parseFloat(formData.height);
    if (!formData.height || isNaN(height)) {
      newErrors.height = "Height is required";
    } else if (height < 50 || height > 300) {
      newErrors.height = "Height must be between 50 and 300 cm";
    }

    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight)) {
      newErrors.weight = "Weight is required";
    } else if (weight < 20 || weight > 500) {
      newErrors.weight = "Weight must be between 20 and 500 kg";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await createUser({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        sex: formData.sex,
        exercising: formData.activityLevel,
        activityLevel: formData.activityLevel,
      });

      navigate("/profile");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative flex items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
      }}
    >
      <div className="absolute inset-0 backdrop-blur-sm pointer-events-none"></div>
      <div className="relative w-full max-w-2xl mx-auto p-8">
        <div className="bg-neutral-50/95 rounded-2xl border-1 border-neutral-400 shadow-xl p-8">
          <div className="mb-4">
            <h3 className="text-3xl font-bold text-neutral-800 mb-2">
              Welcome to Crave Buddy!
            </h3>
            <p className="text-neutral-600">
              Let's get to know you better. Fill in your profile information to
              get started.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldSet>
              <FieldLegend>Personal Information</FieldLegend>
              <FieldDescription>
                This information helps us provide personalized meal
                recommendations.
              </FieldDescription>

              <FieldGroup>
                <Field data-invalid={!!errors.name}>
                  <FieldLabel htmlFor="name">Full Name</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    aria-invalid={!!errors.name}
                    required
                  />
                  {errors.name && <FieldError>{errors.name}</FieldError>}
                </Field>

                <Field data-invalid={!!errors.age}>
                  <FieldLabel htmlFor="age">Age</FieldLabel>
                  <Input
                    id="age"
                    type="number"
                    placeholder="28"
                    value={formData.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    aria-invalid={!!errors.age}
                    min="13"
                    max="120"
                    required
                  />
                  <FieldDescription>
                    Must be between 13 and 120 years old
                  </FieldDescription>
                  {errors.age && <FieldError>{errors.age}</FieldError>}
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field data-invalid={!!errors.height}>
                    <FieldLabel htmlFor="height">Height (cm)</FieldLabel>
                    <Input
                      id="height"
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) =>
                        handleInputChange("height", e.target.value)
                      }
                      aria-invalid={!!errors.height}
                      min="50"
                      max="300"
                      step="0.1"
                      required
                    />
                    {errors.height && <FieldError>{errors.height}</FieldError>}
                  </Field>

                  <Field data-invalid={!!errors.weight}>
                    <FieldLabel htmlFor="weight">Weight (kg)</FieldLabel>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="75"
                      value={formData.weight}
                      onChange={(e) =>
                        handleInputChange("weight", e.target.value)
                      }
                      aria-invalid={!!errors.weight}
                      min="20"
                      max="500"
                      step="0.1"
                      required
                    />
                    {errors.weight && <FieldError>{errors.weight}</FieldError>}
                  </Field>
                </div>

                <Field>
                  <FieldLabel>Sex</FieldLabel>
                  <RadioGroup
                    value={formData.sex}
                    onValueChange={(value) => handleInputChange("sex", value)}
                    className="flex gap-6"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <label
                        htmlFor="male"
                        className="text-sm font-medium text-neutral-800"
                      >
                        Male
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <label
                        htmlFor="female"
                        className="text-sm font-medium text-neutral-800"
                      >
                        Female
                      </label>
                    </div>
                  </RadioGroup>
                </Field>

                <Field>
                  <FieldLabel>Activity Level</FieldLabel>
                  <FieldDescription>
                    Select the option that best describes your exercise routine
                  </FieldDescription>
                  <RadioGroup
                    value={formData.activityLevel}
                    onValueChange={(value) =>
                      handleInputChange("activityLevel", value as ActivityLevel)
                    }
                    className="space-y-1"
                  >
                    {[
                      {
                        value: "sedentary",
                        label: "Sedentary",
                        description: "Little to no exercise",
                      },
                      {
                        value: "light",
                        label: "Light Active",
                        description: "1-3 times per week",
                      },
                      {
                        value: "moderate",
                        label: "Moderate Active",
                        description: "4-5 times per week",
                      },
                      {
                        value: "active",
                        label: "Active",
                        description:
                          "Daily exercise or intense exercise 3-4 times per week",
                      },
                      {
                        value: "very_active",
                        label: "Very Active",
                        description: "Intense exercise 6-7 times per week",
                      },
                    ].map((option) => (
                      <div
                        key={option.value}
                        className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:bg-neutral-50"
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={option.value}
                            className="cursor-pointer"
                          >
                            <div className="font-medium text-sm text-neutral-800">
                              {option.label}
                            </div>
                            <div className="text-xs text-neutral-600">
                              {option.description}
                            </div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                </Field>
              </FieldGroup>

              <div className="flex gap-4 mt-6">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating Profile..." : "Create Profile"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </FieldSet>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
