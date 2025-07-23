document.addEventListener('DOMContentLoaded', () => {
    const apiUrl = '/students';
    const studentForm = document.getElementById('student-form');
    const studentTableBody = document.getElementById('student-table-body');
    const studentIdInput = document.getElementById('student-id'); // input hidden นี้จะเก็บ student_id แทน
    const studentIdField = document.getElementById('student_id'); // input ที่มองเห็นสำหรับกรอกรหัสนักศึกษา
    const submitButton = document.getElementById('submit-button');

    // ฟังก์ชันสำหรับดึงข้อมูลและแสดงในตาราง
    const fetchStudents = async () => {
        try {
            const response = await fetch(apiUrl);
            const students = await response.json();

            studentTableBody.innerHTML = '';
            students.forEach(student => {
                const row = document.createElement('tr');
                
                // *** เปลี่ยน data-id ให้เก็บค่า student.student_id ***
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

    // ฟังก์ชันสำหรับรีเซ็ตฟอร์ม
    const resetForm = () => {
        studentForm.reset();
        studentIdInput.value = ''; // เคลียร์ hidden input
        studentIdField.readOnly = false; // ทำให้ช่องกรอกรหัสนักศึกษา กลับมาแก้ไขได้
        submitButton.textContent = 'เพิ่มข้อมูล';
        submitButton.classList.remove('editing');
    };

    // จัดการการ submit ฟอร์ม (ทั้งสร้างและแก้ไข)
    studentForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const studentData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            student_id: document.getElementById('student_id').value,
            date_of_birth: document.getElementById('date_of_birth').value,
            gender: document.getElementById('gender').value,
        };
        
        // *** ค่า id ที่ได้จาก hidden input ตอนนี้คือ student_id ***
        const idToUpdate = studentIdInput.value;
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
            } else {
                console.error('Failed to save student');
            }
        } catch (error) {
            console.error('Error saving student:', error);
        }
    });

    // จัดการการกดปุ่ม "แก้ไข" และ "ลบ"
    studentTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        // *** ตัวแปร id ที่ได้จาก data-id ตอนนี้คือ student_id ***
        const id = target.dataset.id;

        if (target.classList.contains('edit-btn')) {
            try {
                // *** fetch โดยใช้ student_id ***
                const response = await fetch(`${apiUrl}/${id}`);
                const student = await response.json();

                // *** ตั้งค่า hidden input เป็น student_id ที่จะแก้ไข ***
                studentIdInput.value = student.student_id;
                
                // กรอกข้อมูลลงฟอร์ม
                document.getElementById('first_name').value = student.first_name;
                document.getElementById('last_name').value = student.last_name;
                document.getElementById('student_id').value = student.student_id;
                document.getElementById('date_of_birth').value = new Date(student.date_of_birth).toISOString().split('T')[0];
                document.getElementById('gender').value = student.gender;

                studentIdField.readOnly = true; // *** ตอนแก้ไข ไม่ควรให้แก้รหัสนักศึกษา ***
                submitButton.textContent = 'บันทึกการแก้ไข';
                submitButton.classList.add('editing');
                window.scrollTo(0, 0);
            } catch (error) {
                console.error('Error fetching student for edit:', error);
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?')) {
                try {
                    // *** fetch โดยใช้ student_id ***
                    const response = await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
                    if (response.ok) {
                        fetchStudents();
                    } else {
                        console.error('Failed to delete student');
                    }
                } catch (error) {
                    console.error('Error deleting student:', error);
                }
            }
        }
    });

    // เริ่มโหลดข้อมูลครั้งแรกเมื่อหน้าเว็บพร้อมใช้งาน
    fetchStudents();
});