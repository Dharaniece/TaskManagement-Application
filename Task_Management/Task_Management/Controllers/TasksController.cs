using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Task_Management.Data;
using Task_Management.DTOs;
using Task_Management.Models;
using Task_Management.Services;

namespace Task_Management.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly AuditService _audit;

        public TasksController(AppDbContext context, AuditService audit)
        {
            _context = context;
            _audit = audit;
        }

        private string GetUserEmail() =>
            User.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown User";

        private string GetUserRole() =>
            User.FindFirst(ClaimTypes.Role)?.Value ?? "User";

        // GET: api/tasks
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _context.Tasks
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();

            var result = tasks.Select(t => new
            {
                t.Id,
                t.Title,
                t.Description,
                AssignedTo = !string.IsNullOrEmpty(t.AssignedToSerialized)
                    ? t.AssignedToSerialized.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    : new string[] { },
                t.Status,
                t.Priority,
                t.DueDate,
                t.CreatedBy,
                t.CreatedDate,
                t.UpdatedDate
            });

            return Ok(result);
        }

        // GET: api/tasks/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            var result = new
            {
                task.Id,
                task.Title,
                task.Description,
                AssignedTo = !string.IsNullOrEmpty(task.AssignedToSerialized)
                    ? task.AssignedToSerialized.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    : new string[] { },
                task.Status,
                task.Priority,
                task.DueDate,
                task.CreatedBy,
                task.CreatedDate,
                task.UpdatedDate
            };

            return Ok(result);
        }

        // POST: api/tasks
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskCreateDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Title))
                return BadRequest(new { Title = "Title is required." });

            var newTask = new TaskItem
            {
                Title = dto.Title.Trim(),
                Description = dto.Description?.Trim(),
                AssignedToSerialized = dto.AssignedTo != null && dto.AssignedTo.Any()
                    ? string.Join(",", dto.AssignedTo)
                    : null,
                Status = dto.Status ?? "Pending",
                Priority = dto.Priority ?? "Medium",
                DueDate = dto.DueDate,
                CreatedBy = dto.CreatedBy ?? GetUserEmail(),
                CreatedDate = DateTime.UtcNow
            };

            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            var assignedNames = dto.AssignedTo != null && dto.AssignedTo.Any()
                ? string.Join(", ", dto.AssignedTo)
                : "none";

            _audit.Log(
                GetUserEmail(),
                "Created",
                "Task",
                $"Task '{newTask.Title}' assigned to {assignedNames}"
            );

            return CreatedAtAction(nameof(GetById), new { id = newTask.Id }, newTask);
        }

        // PUT: api/tasks/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskUpdateDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            var role = GetUserRole();

            if (role == "Admin")
            {
                task.Title = dto.Title ?? task.Title;
                task.Description = dto.Description ?? task.Description;
                task.AssignedToSerialized = dto.AssignedTo != null && dto.AssignedTo.Any()
                    ? string.Join(",", dto.AssignedTo)
                    : task.AssignedToSerialized;
                task.Status = dto.Status ?? task.Status;
                task.Priority = dto.Priority ?? task.Priority;
                task.DueDate = dto.DueDate ?? task.DueDate;
            }
            else
            {
                // normal user can update only status
                if (!string.IsNullOrEmpty(dto.Status))
                    task.Status = dto.Status;
            }

            task.UpdatedDate = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _audit.Log(
                GetUserEmail(),
                "Updated",
                "Task",
                $"Task '{task.Title}' updated. Status: {task.Status}"
            );

            return Ok(task);
        }

        // DELETE: api/tasks/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null) return NotFound();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();

            _audit.Log(
                GetUserEmail(),
                "Deleted",
                "Task",
                $"Task '{task.Title}' was deleted."
            );

            return NoContent();
        }
    }
}
