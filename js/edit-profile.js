import {
    auth,
    db,
    doc,
    getDoc,
    updateDoc,
    onAuthStateChanged
} from "./firebase.js";

/* ==========================================
   VARIABLES
========================================== */

let currentUser = null;

let cropper = null;

let currentInput = null;

let currentPreview = null;

let cropAspectRatio = 1;

/* ==========================================
   CROPPER ELEMENTS
========================================== */

const cropModal = document.getElementById("cropModal");

const cropImage = document.getElementById("cropImage");

const cropButton = document.getElementById("cropButton");

const cancelCrop = document.getElementById("cancelCrop");

/* ==========================================
   FORM ELEMENTS
========================================== */

const form = document.getElementById("profileForm");

const profileLink = document.getElementById("profileLink");

/* Upload Areas */

const photoDropZone =
    document.querySelector('label[for="photoFile"]');

const coverDropZone =
    document.getElementById("coverDropZone");

/* File Inputs */

const photoFile =
    document.getElementById("photoFile");

const coverFile =
    document.getElementById("coverFile");

/* Hidden Inputs */

const photoInput =
    document.getElementById("photo");

const coverInput =
    document.getElementById("cover");

/* Text Inputs */

const usernameInput =
    document.getElementById("username");

const locationInput =
    document.getElementById("location");

const bioInput =
    document.getElementById("bio");

const websiteInput =
    document.getElementById("website");

const githubInput =
    document.getElementById("github");

const linkedinInput =
    document.getElementById("linkedin");

/* Editor Images */

const photoPreview =
    document.getElementById("photoPreview");

const coverPreview =
    document.getElementById("coverPreview");

/* Live Preview */

const previewPhoto =
    document.getElementById("previewPhoto");

const previewCover =
    document.getElementById("previewCover");

const previewUsername =
    document.getElementById("previewUsername");

const previewLocation =
    document.getElementById("previewLocation");

const previewBio =
    document.getElementById("previewBio");

const previewWebsite =
    document.getElementById("previewWebsite");

const previewGithub =
    document.getElementById("previewGithub");

const previewLinkedin =
    document.getElementById("previewLinkedin");

/* Misc */

const bioCount =
    document.getElementById("bioCount");

const uploadProgress =
    document.getElementById("uploadProgress");

/* ==========================================
   AUTHENTICATION
========================================== */

onAuthStateChanged(auth, async (user) => {

    if (!user) {

        window.location.replace("login.html");

        return;

    }

    currentUser = user;

    profileLink.href =
        `profile.html?id=${user.uid}`;

    await loadProfile();

});

/* ==========================================
   INITIALIZE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    updatePreview();

});


/* ==========================================
   LOAD PROFILE
========================================== */

async function loadProfile() {

    try {

        const snapshot = await getDoc(
            doc(db, "users", currentUser.uid)
        );

        if (!snapshot.exists()) {

            updatePreview();

            return;

        }

        const profile = snapshot.data();

        usernameInput.value = profile.username || "";

        locationInput.value = profile.location || "";

        bioInput.value = profile.bio || "";

        websiteInput.value = profile.website || "";

        githubInput.value = profile.github || "";

        linkedinInput.value = profile.linkedin || "";

        photoInput.value = profile.photo || "";

        coverInput.value = profile.cover || "";

        if (profile.photo) {

            photoPreview.src = profile.photo;

            previewPhoto.src = profile.photo;

        }

        if (profile.cover) {

            coverPreview.src = profile.cover;

            previewCover.src = profile.cover;

        }

        updatePreview();

    }

    catch (error) {

        console.error(error);

        alert("Failed to load profile.");

    }

}

/* ==========================================
   LIVE PREVIEW
========================================== */

function updatePreview() {

    previewUsername.textContent =
        usernameInput.value.trim() || "Username";

    previewLocation.textContent =
        locationInput.value.trim()
            ? `📍 ${locationInput.value.trim()}`
            : "📍 Your Location";

    previewBio.textContent =
        bioInput.value.trim() ||
        "Your bio will appear here...";

    bioCount.textContent =
        bioInput.value.length;

    updateSocialPreview(
        previewWebsite,
        websiteInput.value
    );

    updateSocialPreview(
        previewGithub,
        githubInput.value
    );

    updateSocialPreview(
        previewLinkedin,
        linkedinInput.value
    );

}

/* ==========================================
   SOCIAL LINKS PREVIEW
========================================== */

function updateSocialPreview(link, value) {

    if (!link) return;

    const url = value.trim();

    if (!url) {

        link.style.display = "none";

        return;

    }

    link.href = url;

    link.style.display = "inline-flex";

}

/* ==========================================
   LIVE INPUT LISTENERS
========================================== */

[
    usernameInput,
    locationInput,
    bioInput,
    websiteInput,
    githubInput,
    linkedinInput
].forEach(input => {

    input.addEventListener(
        "input",
        updatePreview
    );

});

/* ==========================================
   IMAGE VALIDATION
========================================== */

function validateImage(file) {

    if (!file) {

        throw new Error(
            "Please choose an image."
        );

    }

    const allowedTypes = [

        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"

    ];

    if (!allowedTypes.includes(file.type)) {

        throw new Error(
            "Only JPG, PNG and WEBP images are allowed."
        );

    }

    const maxSize =
        5 * 1024 * 1024;

    if (file.size > maxSize) {

        throw new Error(
            "Maximum image size is 5 MB."
        );

    }

}

/* ==========================================
   OPEN CROPPER
========================================== */

function openCropper(
    file,
    input,
    editorPreview,
    livePreview,
    aspectRatio
) {

    validateImage(file);

    currentInput = input;

    currentPreview = {

        editor: editorPreview,

        live: livePreview

    };

    cropAspectRatio = aspectRatio;

    cropImage.src =
        URL.createObjectURL(file);

    cropModal.style.display = "flex";

    if (cropper) {

        cropper.destroy();

    }

    cropImage.onload = () => {

        cropper = new Cropper(cropImage, {

            aspectRatio: cropAspectRatio,

            viewMode: 1,

            autoCropArea: 1,

            responsive: true,

            movable: true,

            zoomable: true,

            scalable: false,

            rotatable: false,

            background: false

        });
    };
}

/* ==========================================
   FILE INPUTS
========================================== */

photoFile.addEventListener("change", () => {

    const file = photoFile.files[0];

    if (!file) return;

    openCropper(

        file,

        photoFile,

        photoPreview,

        previewPhoto,

        1

    );

});

coverFile.addEventListener("change", () => {

    const file = coverFile.files[0];

    if (!file) return;

    openCropper(

        file,

        coverFile,

        coverPreview,

        previewCover,

        16 / 9

    );

});

/* ==========================================
   DRAG & DROP
========================================== */

function setupDragAndDrop(

    dropZone,

    input,

    editorPreview,

    livePreview,

    aspectRatio

) {

    if (!dropZone) return;

    ["dragenter", "dragover"].forEach(event => {

        dropZone.addEventListener(event, e => {

            e.preventDefault();

            dropZone.classList.add("dragover");

        });

    });

    ["dragleave", "drop"].forEach(event => {

        dropZone.addEventListener(event, e => {

            e.preventDefault();

            dropZone.classList.remove("dragover");

        });

    });

    dropZone.addEventListener("drop", e => {

        const file = e.dataTransfer.files[0];

        if (!file) return;

        openCropper(

            file,

            input,

            editorPreview,

            livePreview,

            aspectRatio

        );

    });

}

setupDragAndDrop(

    photoDropZone,

    photoFile,

    photoPreview,

    previewPhoto,

    1

);

setupDragAndDrop(

    coverDropZone,

    coverFile,

    coverPreview,

    previewCover,

    16 / 9

);

/* ==========================================
   CANCEL CROPPER
========================================== */

cancelCrop.addEventListener("click", () => {

    cropModal.style.display = "none";

    if (cropper) {

        cropper.destroy();

        cropper = null;

    }

});

/* ==========================================
   APPLY CROP
========================================== */

cropButton.addEventListener("click", () => {

    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({

        imageSmoothingQuality: "high"

    });

    canvas.toBlob(blob => {

        const file = new File(

            [blob],

            "cropped-image.png",

            {

                type: "image/png"

            }

        );

        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);

        currentInput.files = dataTransfer.files;

        const imageURL = URL.createObjectURL(blob);

        currentPreview.editor.src = imageURL;

        currentPreview.live.src = imageURL;

        cropModal.style.display = "none";

        cropper.destroy();

        cropper = null;

    });

});

/* ==========================================
   PROGRESS BAR
========================================== */

function showProgress() {

    if (!uploadProgress) return;

    uploadProgress.parentElement.style.display = "block";

    uploadProgress.style.width = "0%";

}

function updateProgress(value) {

    if (!uploadProgress) return;

    uploadProgress.style.width = value + "%";

}

function hideProgress() {

    if (!uploadProgress) return;

    uploadProgress.style.width = "100%";

    setTimeout(() => {

        uploadProgress.parentElement.style.display = "none";

        uploadProgress.style.width = "0%";

    }, 800);

}

/* ==========================================
   CLOUDINARY UPLOAD
========================================== */

async function uploadImage(file) {

    validateImage(file);

    showProgress();

    try {

        const formData = new FormData();

        formData.append("file", file);

        formData.append(

            "upload_preset",

            "articlehub"

        );

        updateProgress(30);

        const response = await fetch(

            "https://api.cloudinary.com/v1_1/tnjzxo69/image/upload",

            {

                method: "POST",

                body: formData

            }

        );

        updateProgress(70);

        const data = await response.json();

        if (!response.ok) {

            throw new Error(

                data.error?.message ||

                "Cloudinary upload failed."

            );

        }

        updateProgress(100);

        hideProgress();

        return data.secure_url;

    }

    catch (error) {

        hideProgress();

        throw error;

    }

}

/* ==========================================
   FORM VALIDATION
========================================== */

function validateForm() {

    const username =

        usernameInput.value.trim();

    if (username.length < 3) {

        throw new Error(

            "Username must contain at least 3 characters."

        );

    }

    if (bioInput.value.length > 250) {

        throw new Error(

            "Bio cannot exceed 250 characters."

        );

    }

    [

        websiteInput,

        githubInput,

        linkedinInput

    ].forEach(input => {

        const value = input.value.trim();

        if (

            value &&

            !value.startsWith("http://") &&

            !value.startsWith("https://")

        ) {

            throw new Error(

                "All links must start with http:// or https://"

            );

        }

    });

}

/* ==========================================
   BUTTON HELPERS
========================================== */

function disableButton(button, text) {

    button.disabled = true;

    button.dataset.original =

        button.innerHTML;

    button.innerHTML = text;

}

function enableButton(button) {

    button.disabled = false;

    if (button.dataset.original) {

        button.innerHTML =

            button.dataset.original;

    }

}

/* ==========================================
   SAVE PROFILE
========================================== */

form.addEventListener(

    "submit",

    async (e) => {

        e.preventDefault();

        const saveButton =

            document.querySelector(".save-btn");

        try {

            validateForm();

            disableButton(

                saveButton,

                "Saving..."

            );

            let photoURL =

                photoInput.value;

            let coverURL =

                coverInput.value;

            /* Upload Profile Photo */

            if (photoFile.files.length) {

                disableButton(

                    saveButton,

                    "Uploading Profile..."

                );

                photoURL = await uploadImage(

                    photoFile.files[0]

                );

            }

            /* Upload Cover Photo */

            if (coverFile.files.length) {

                disableButton(

                    saveButton,

                    "Uploading Cover..."

                );

                coverURL = await uploadImage(

                    coverFile.files[0]

                );

            }

            disableButton(

                saveButton,

                "Saving Profile..."

            );

            await updateDoc(

                doc(

                    db,

                    "users",

                    currentUser.uid

                ),

                {

                    username:

                        usernameInput.value.trim(),

                    location:

                        locationInput.value.trim(),

                    bio:

                        bioInput.value.trim(),

                    website:

                        websiteInput.value.trim(),

                    github:

                        githubInput.value.trim(),

                    linkedin:

                        linkedinInput.value.trim(),

                    photo:

                        photoURL,

                    cover:

                        coverURL,

                    updatedAt:

                        new Date()

                }

            );

            alert(

                "✅ Profile updated successfully!"

            );

            window.location.href =

                `profile.html?id=${currentUser.uid}`;

        }

        catch (error) {

            console.error(error);

            alert(error.message);

        }

        finally {

            enableButton(saveButton);

        }

    }

);

/* ==========================================
   RESET CROPPER
========================================== */

function resetCropper() {

    if (cropper) {

        cropper.destroy();

        cropper = null;

    }

    cropImage.src = "";

    currentInput = null;

    currentPreview = null;

}

/* ==========================================
   CANCEL CROPPER
========================================== */

cancelCrop.addEventListener("click", () => {

    cropModal.style.display = "none";

    resetCropper();

});

/* ==========================================
   CLEANUP OBJECT URLS
========================================== */

window.addEventListener(

    "beforeunload",

    () => {

        if (

            photoPreview.src &&

            photoPreview.src.startsWith("blob:")

        ) {

            URL.revokeObjectURL(

                photoPreview.src

            );

        }

        if (

            coverPreview.src &&

            coverPreview.src.startsWith("blob:")

        ) {

            URL.revokeObjectURL(

                coverPreview.src

            );

        }

    }

);

/* ==========================================
   BIO CHARACTER COUNTER
========================================== */

bioInput.addEventListener(

    "input",

    () => {

        const length =

            bioInput.value.length;

        bioCount.textContent =

            length;

        bioCount.style.color =

            length > 250

                ? "red"

                : "";

    }

);

/* ==========================================
   FILE SIZE PRECHECK
========================================== */

function checkFileSize(file) {

    if (!file) return;

    const maxSize =

        5 * 1024 * 1024;

    if (file.size > maxSize) {

        alert(

            "Image must be below 5 MB."

        );

    }

}

photoFile.addEventListener(

    "change",

    () => {

        checkFileSize(

            photoFile.files[0]

        );

    }

);

coverFile.addEventListener(

    "change",

    () => {

        checkFileSize(

            coverFile.files[0]

        );

    }

);

/* ==========================================
   INITIALIZE PAGE
========================================== */

document.addEventListener(

    "DOMContentLoaded",

    () => {

        updatePreview();

        bioCount.textContent =

            bioInput.value.length;

    }

);

/* ==========================================
   SAFETY CHECKS
========================================== */

if (!form) {

    console.error(

        "Profile form not found."

    );

}

console.log(

    "Edit Profile JS Loaded"

);