import React, { useEffect, useState } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { useDisclosure, Chip, Image, Textarea, Input } from "@heroui/react";
import axios from "axios";
import { Spinner } from "@heroui/spinner";

//Images
import LoaderImage from "../assets/images/Loader.gif";

const ViewButton = ({ country, flag }) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [guide, setGuide] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch guide when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchGuide = async () => {
        setLoading(true);
        try {
          const response = await axios.post(
            "http://localhost:5000/api/country-guide",
            { country }
          );
          setGuide(response.data.result);
        } catch (error) {
          console.error("Error fetching country guide:", error);
          setGuide("Sorry! Could not load country guide.");
        } finally {
          setLoading(false);
        }
      };

      fetchGuide();
    }
  }, [isOpen, country]);

  return (
    <>
      <Button onPress={onOpen} size="sm" variant="ghost" color="primary">
        Visit
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="xl"
        className="font-semibold"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {"Traveling to " + country}
                <p className="text-sm text-gray-500">
                  Your AI travel guide is ready to assist you!
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Chip variant="solid" color="primary" size="sm">
                    {country}
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody>
                {loading ? (
                  <div className="flex flex-col items-center justify-center text-center space-y-4">
                    <p className="text-lg font-medium">
                      Traveling to {country}... Please Wait
                    </p>

                    <img
                      src={LoaderImage}
                      alt="Loading..."
                      className="w-50 h-50"
                    />

                    <Spinner
                      classNames={{ label: "text-foreground mt-4" }}
                      variant="default"
                      size="lg"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start p-4">
                    {/* Right: Guide Profile and Textarea only */}
                    <div className="w-full col-span-2 space-y-2 ">
                      <div className="flex items-center justify-center mb-4">
                        <img
                          src={flag}
                          alt="Loading..."
                          className="w-50 h-50 rounded-lg shadow-lg" // Flag image
                        />
                      </div>

                      <div className="flex items-center space-x-4 ">
                        <img
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSvbmogXrtrNtTEWVwFQO3RKNI8Ri7BixXIQ&s" // Replace with your preferred guide image
                          alt="Guide Avatar"
                          className="w-12 h-12 rounded-full shadow-md mt-4"
                        />
                        <div>
                          <p className="font-semibold text-gray-800">Luffy</p>
                          <p className="text-sm text-gray-500">
                            Your AI travel guide.
                          </p>
                        </div>
                      </div>
                      <Textarea
                        className="w-full"
                        labelPlacement="outside"
                        placeholder="Enter your description"
                        variant="bordered"
                        value={guide}
                      />
                    </div>
                  </div>
                )}
              </ModalBody>
              <ModalFooter></ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default ViewButton;
