window.addEventListener('DOMContentLoaded',async()=>{
    const textarea =document.getElementById('note');
    const SaveBtn =document.getElementByID('save');

    const deleteBtn = document.getElementById('deleteBtn');
    deleteBtn.innerText="DELETE";
    
     deleteBtn.addEventListener('click', async () => {
    const confirmDelete = confirm("Are you sure you want to delete this note?");
  if (confirmDelete) {
    const response = await window.electronAPI.deleteNote();
    if (response.success) {
      alert("Note deleted!");
      document.getElementById('noteInput').value = ''; // Clear the UI
    } else {
      alert("Error: " + response.error);
    }
  }
});


    //Load saved note on startup
    const savedNote =await window.electronAPI.loadNote();
    textarea.value=savedNote;

    SaveBtn.addEventListener('click',async()=>{
        await window.electronAPI.saveNote(textarea.value);
        alert('Note Saved Successfull!');
    });
}); 