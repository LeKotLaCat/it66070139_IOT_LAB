document.addEventListener('DOMContentLoaded', () => {
    // const baseApiUrl = 'https://student-api-final.your-subdomain.workers.dev';
    // const apiUrl = `${baseApiUrl}/api/students`;
    const apiUrl = '/api/students';
    const studentForm = document.getElementById('student-form');
    const studentTableBody = document.getElementById('student-table-body');
    const studentIdHiddenInput = document.getElementById('student-id-hidden');
    const studentIdVisibleField = document.getElementById('student_id');
    const submitButton = document.getElementById('submit-button');

    const fetchStudents = async () => {
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('Network response was not ok');
            const students = await response.json();
            studentTableBody.innerHTML = '';
            students.forEach(student => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${student.student_id}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${new Date(student.date_of_birth).toLocaleDateString('th-TH')}</td>
                    <td>${student.gender}</td>
                    <td class="action-buttons">
                        <button class="edit-btn" data-id="${student.student_id}">แก้ไข</button>
                        <button class="delete-btn" data-id="${student.student_id}">ลบ</button>
                    </td>
                `;
                studentTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    const resetForm = () => {
        studentForm.reset();
        studentIdHiddenInput.value = '';
        studentIdVisibleField.readOnly = false;
        submitButton.textContent = 'เพิ่มข้อมูล';
        submitButton.classList.remove('editing');
    };

    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const studentData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            student_id: studentIdVisibleField.value,
            date_of_birth: document.getElementById('date_of_birth').value,
            gender: document.getElementById('gender').value,
        };
        const idToUpdate = studentIdHiddenInput.value;
        const method = idToUpdate ? 'PUT' : 'POST';
        const url = idToUpdate ? `${apiUrl}/${idToUpdate}` : apiUrl;

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentData),
            });
            if (response.ok) {
                resetForm();
                fetchStudents();
            } else { console.error('Failed to save student'); }
        } catch (error) { console.error('Error saving student:', error); }
    });

    studentTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const id = target.dataset.id;
        if (target.classList.contains('edit-btn')) {
            try {
                const response = await fetch(`${apiUrl}/${id}`);
                const student = await response.json();
                studentIdHiddenInput.value = student.student_id;
                document.getElementById('first_name').value = student.first_name;
                document.getElementById('last_name').value = student.last_name;
                studentIdVisibleField.value = student.student_id;
                document.getElementById('date_of_birth').value = new Date(student.date_of_birth).toISOString().split('T')[0];
                document.getElementById('gender').value = student.gender;
                studentIdVisibleField.readOnly = true;
                submitButton.textContent = 'บันทึกการแก้ไข';
                submitButton.classList.add('editing');
                window.scrollTo(0, 0);
            } catch (error) { console.error('Error fetching student for edit:', error); }
        }
        if (target.classList.contains('delete-btn')) {
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
                try {
                    const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchStudents();
                    } else { console.error('Failed to delete student'); }
                } catch (error) { console.error('Error deleting student:', error); }
            }
        }
    });
    fetchStudents();
});