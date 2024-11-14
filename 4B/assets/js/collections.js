const editCollectionModal = document.getElementById("editCollectionModal");
editCollectionModal.addEventListener("show.bs.modal", (event) => {
  const button = event.relatedTarget;
  const collectionId = button.getAttribute("data-id");
  const collectionName = button.getAttribute("data-name");

  // Update modal's content
  const modalTitle = editCollectionModal.querySelector(".modal-title");
  const modalBodyInput = editCollectionModal.querySelector(
    "#editCollectionName"
  );
  const modalHiddenInput =
    editCollectionModal.querySelector("#editCollectionId");

  modalTitle.textContent = "Edit Collection: " + collectionName;
  modalBodyInput.value = collectionName;
  modalHiddenInput.value = collectionId;
});

document.getElementById("editCollectionForm").onsubmit = function (event) {
  event.preventDefault();
  const form = event.target;
  const collectionId = form.collectionId.value;

  // Kirim data ke server
  fetch(`/edit/${collectionId}`, {
    method: "POST",
    body: new URLSearchParams(new FormData(form)),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).then((response) => {
    if (response.redirected) {
      window.location.href = response.url;
    }
  });
};

function confirmDelete() {
  return confirm("Are you sure you want to delete this collection?");
}
