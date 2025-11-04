using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Task_Management.Data;
using Task_Management.Models;
using Task_Management.Services;
using System.Security.Claims; 

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

        private string GetUserEmail()
        {
            return User.FindFirst(ClaimTypes.Email)?.Value ?? "Unknown User";
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _context.Tasks
                .OrderByDescending(t => t.CreatedDate)
                .ToListAsync();

            return Ok(tasks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.Id == id);
            if (task == null)
                return NotFound();

            return Ok(task);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] TaskItem newTask)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            newTask.CreatedDate = DateTime.UtcNow;
            _context.Tasks.Add(newTask);
            await _context.SaveChangesAsync();

            _audit.Log(
                GetUserEmail(),
                "Created",
                "Task",
                $"Task '{newTask.Title}' assigned to {newTask.AssignedTo ?? "none"}"
            );

            return CreatedAtAction(nameof(GetById), new { id = newTask.Id }, newTask);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] TaskItem updatedTask)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound();

            var oldTitle = task.Title;
            var oldStatus = task.Status;

            task.Title = updatedTask.Title;
            task.Description = updatedTask.Description;
            task.AssignedTo = updatedTask.AssignedTo;
            task.Status = updatedTask.Status;
            task.Priority = updatedTask.Priority;
            task.DueDate = updatedTask.DueDate;
            task.UpdatedDate = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _audit.Log(
                GetUserEmail(),
                "Updated",
                "Task",
                $"Task '{oldTitle}' status changed from '{oldStatus}' to '{task.Status}'."
            );

            return Ok(task);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound();

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
