import { useRef, useState } from "react";
import { uploadImage } from "../api/uploadApi";

const validEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());

const validPhone = (value) => {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
};

const validContact = (value) => validEmail(value) || validPhone(value);

const cleanContact = (value) =>
  String(value || "").trim().toLowerCase().replace(/\s+/g, "");

function DishUploadForm({ title, buttonText, onSubmit, mode = "solo" }) {
  const [name, setName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [contact, setContact] = useState("");
  const [dishName, setDishName] = useState("");
  const [story, setStory] = useState("");

  const [members, setMembers] = useState([
    {
      name: "",
      contact: "",
      roleLabel: "Member",
    },
  ]);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imagePublicId, setImagePublicId] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [cameraLoading, setCameraLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const uploadSelectedFile = async (file) => {
    try {
      setError("");
      setImageUploading(true);

      setImageFile(file);
      setPreview(URL.createObjectURL(file));
      setImageUrl("");
      setImagePublicId("");

      const uploadData = await uploadImage(file);

      if (!uploadData?.imageUrl) {
        throw new Error("Image upload failed. Please try again.");
      }

      setImageUrl(uploadData.imageUrl);
      setImagePublicId(uploadData.publicId || "");
    } catch (err) {
      setImageFile(null);
      setPreview("");
      setImageUrl("");
      setImagePublicId("");

      setError(
        err.response?.data?.message ||
          err.message ||
          "Image upload failed. Please try again."
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleFile = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    await uploadSelectedFile(file);
    event.target.value = "";
  };

  const openUploadPicker = () => {
    fileInputRef.current?.click();
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const openCamera = async () => {
    try {
      setError("");
      setCameraError("");
      setCameraLoading(true);

      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      const isSecure = window.isSecureContext || isLocalhost;

      if (!isSecure) {
        setError(
          "Camera requires HTTPS or localhost. Please use Upload from Gallery, or open the game on HTTPS."
        );
        setCameraLoading(false);
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError(
          "Camera is not supported in this browser. Please use Upload from Gallery."
        );
        setCameraLoading(false);
        return;
      }

      setCameraOpen(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      streamRef.current = stream;

      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      setCameraOpen(false);
      setCameraError("");
      setError(
        "Could not open camera. Please allow camera permission or use Upload from Gallery."
      );
    } finally {
      setCameraLoading(false);
    }
  };

  const closeCamera = () => {
    stopCamera();
    setCameraOpen(false);
    setCameraError("");
    setCameraLoading(false);
  };

  const capturePhoto = async () => {
    try {
      if (!videoRef.current) {
        throw new Error("Camera is not ready.");
      }

      const video = videoRef.current;
      const canvas = document.createElement("canvas");

      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;

      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.7);
      });

      if (!blob) {
        throw new Error("Could not capture photo. Please try again.");
      }

      const capturedFile = new File([blob], `food-photo-${Date.now()}.jpg`, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });

      closeCamera();
      await uploadSelectedFile(capturedFile);
    } catch (err) {
      setCameraError(err.message || "Could not capture photo.");
    }
  };

  const addMemberRow = () => {
    if (members.length >= 5) {
      setError("You can add up to 5 extra members. Captain is already included.");
      return;
    }

    setMembers([
      ...members,
      {
        name: "",
        contact: "",
        roleLabel: "Member",
      },
    ]);
  };

  const removeMemberRow = (index) => {
    setMembers(members.filter((_, memberIndex) => memberIndex !== index));
  };

  const updateMember = (index, field, value) => {
    setMembers(
      members.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member
      )
    );
  };

  const getValidMembers = () => {
    if (mode !== "team") {
      return [];
    }

    return members
      .map((member) => ({
        name: member.name.trim(),
        contact: cleanContact(member.contact),
        roleLabel: member.roleLabel.trim() || "Member",
      }))
      .filter((member) => member.name || member.contact);
  };

  const validateMembers = (teamMembers) => {
    const usedContacts = new Set([cleanContact(contact)]);

    for (const member of teamMembers) {
      if (!member.name || member.name.length < 2) {
        return "Please enter member name or remove the empty member row.";
      }

      if (!member.contact || !validContact(member.contact)) {
        return "Please enter a valid email or mobile number for every team member.";
      }

      if (usedContacts.has(member.contact)) {
        return "Captain and team members must use different email/mobile numbers.";
      }

      usedContacts.add(member.contact);
    }

    return null;
  };

  const submit = async (event) => {
    event.preventDefault();

    if (mode === "team" && !teamName.trim()) {
      setError("Please enter team name.");
      return;
    }

    if (!name.trim()) {
      setError(mode === "team" ? "Please enter captain name." : "Please enter your name.");
      return;
    }

    if (!validContact(contact)) {
      setError("Please enter a valid email or mobile number.");
      return;
    }

    if (!dishName.trim()) {
      setError("Please enter dish name.");
      return;
    }

    if (!story.trim()) {
      setError("Please write a short story.");
      return;
    }

    if (!imageFile) {
      setError("Please upload from gallery or capture a live food photo.");
      return;
    }

    if (imageUploading) {
      setError("Please wait. Your food photo is still uploading.");
      return;
    }

    if (!imageUrl) {
      setError("Photo upload is not complete. Please choose or capture the photo again.");
      return;
    }

    const validMembers = getValidMembers();
    const memberError = validateMembers(validMembers);

    if (memberError) {
      setError(memberError);
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await onSubmit({
        teamName: teamName.trim(),
        name: name.trim(),
        contact: cleanContact(contact),
        dishName: dishName.trim(),
        story: story.trim(),
        imageUrl,
        imagePublicId,
        members: validMembers,
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form className="form-card" onSubmit={submit}>
        <h2>{title}</h2>

        {error && <div className="error-text">{error}</div>}

        {mode === "team" && (
          <>
            <label>Team name</label>
            <input
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Example: Sharma Kitchen Stars"
            />
          </>
        )}

        <label>{mode === "team" ? "Captain name" : "Your name"}</label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Example: Rahul"
        />

        <label>
          {mode === "team"
            ? "Captain email or mobile number"
            : "Email or mobile number"}
        </label>
        <input
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="example@gmail.com or 9876543210"
        />

        {mode === "team" && (
          <div className="team-members-box">
            <div className="team-members-head">
              <div>
                <h3>Team members</h3>
                <p>
                  Add members who are part of this team. Captain is already counted.
                </p>
              </div>

              <button type="button" onClick={addMemberRow}>
                + Add
              </button>
            </div>

            <div className="team-member-list">
              {members.map((member, index) => (
                <div className="team-member-row" key={index}>
                  <div className="member-grid">
                    <div>
                      <label>Member name</label>
                      <input
                        value={member.name}
                        onChange={(event) =>
                          updateMember(index, "name", event.target.value)
                        }
                        placeholder="Example: Neha"
                      />
                    </div>

                    <div>
                      <label>Email or mobile</label>
                      <input
                        value={member.contact}
                        onChange={(event) =>
                          updateMember(index, "contact", event.target.value)
                        }
                        placeholder="9876543210"
                      />
                    </div>
                  </div>

                  <div>
                    <label>Role</label>
                    <input
                      value={member.roleLabel}
                      onChange={(event) =>
                        updateMember(index, "roleLabel", event.target.value)
                      }
                      placeholder="Chef / Helper / Taster"
                    />
                  </div>

                  <button
                    type="button"
                    className="remove-member-btn"
                    onClick={() => removeMemberRow(index)}
                  >
                    Remove member
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label>Dish name</label>
        <input
          value={dishName}
          onChange={(event) => setDishName(event.target.value)}
          placeholder="Example: Masala Maggi"
        />

        <label>30-second story</label>
        <textarea
          value={story}
          onChange={(event) => setStory(event.target.value)}
          placeholder="Tell people why this dish should win..."
        />

        <label>Food photo</label>

        <div className="brand-photo-uploader">
          <input
            ref={fileInputRef}
            className="brand-hidden-file"
            type="file"
            accept="image/*"
            onChange={handleFile}
          />

          <div className="brand-photo-header">
            <span>Photo required</span>
            <h3>Upload your dish photo</h3>
            <p>
              Upload from gallery or capture a live image to submit your dish.
            </p>
          </div>

          <div className="brand-photo-actions">
            <button
              type="button"
              className="brand-photo-action"
              onClick={openUploadPicker}
              disabled={imageUploading}
            >
              <span>📁</span>
              <div>
                <strong>Upload from Gallery</strong>
                <small>Choose a saved food photo</small>
              </div>
            </button>

            <button
              type="button"
              className="brand-photo-action brand-camera-action"
              onClick={openCamera}
              disabled={imageUploading}
            >
              <span>📸</span>
              <div>
                <strong>Capture Live Photo</strong>
                <small>Open camera and click now</small>
              </div>
            </button>
          </div>

          {imageUploading && (
            <div className="brand-upload-status">
              Uploading photo to Cloudinary...
            </div>
          )}

          {!imageUploading && imageFile && imageUrl && (
            <div className="brand-upload-success">
              Photo uploaded successfully.
            </div>
          )}

          {preview && (
            <div className="brand-photo-preview">
              <img src={preview} alt="Food preview" />
            </div>
          )}
        </div>

        <button className="primary-btn" disabled={submitting || imageUploading}>
          {imageUploading
            ? "Uploading Photo..."
            : submitting
              ? "Submitting..."
              : buttonText}
        </button>
      </form>

      {cameraOpen && (
        <div className="camera-modal-overlay">
          <div className="camera-modal-card">
            <div className="camera-modal-head">
              <div>
                <span>Camera</span>
                <h3>Capture Food Photo</h3>
              </div>

              <button type="button" onClick={closeCamera}>
                ×
              </button>
            </div>

            {cameraError && <div className="camera-error">{cameraError}</div>}

            <div className="camera-view-box">
              {cameraLoading && (
                <div className="camera-loading">Opening camera...</div>
              )}

              <video
                ref={videoRef}
                className="camera-video"
                playsInline
                muted
                autoPlay
              />
            </div>

            <div className="camera-modal-actions">
              <button type="button" onClick={closeCamera} className="camera-cancel-btn">
                Cancel
              </button>

              <button type="button" onClick={capturePhoto} className="camera-capture-btn">
                Capture Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DishUploadForm;