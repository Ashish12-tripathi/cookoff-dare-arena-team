import { useState } from "react";
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
      roleLabel: "Member"
    }
  ]);

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
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
        roleLabel: "Member"
      }
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
              [field]: value
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
        roleLabel: member.roleLabel.trim() || "Member"
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
      setError("Please upload a food photo.");
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

      const uploadData = await uploadImage(imageFile);

      await onSubmit({
        teamName: teamName.trim(),
        name: name.trim(),
        contact: cleanContact(contact),
        dishName: dishName.trim(),
        story: story.trim(),
        imageUrl: uploadData.imageUrl,
        imagePublicId: uploadData.publicId || "",
        members: validMembers
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Upload failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
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

      <label>{mode === "team" ? "Captain email or mobile number" : "Email or mobile number"}</label>
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
      <input type="file" accept="image/*" onChange={handleFile} />

      {preview && <img className="upload-preview" src={preview} alt="Preview" />}

      <button className="primary-btn" disabled={submitting}>
        {submitting ? "Compressing & Uploading..." : buttonText}
      </button>
    </form>
  );
}

export default DishUploadForm;