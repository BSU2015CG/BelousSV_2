using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using System.IO;
using System.Drawing.Imaging;
using System.ComponentModel;
using System.Diagnostics;
using System.Data;
using Microsoft.Win32;

namespace ImageInfoViewer
{
    class ResultParameter
    {
        public List<BindingImage> Images;
        public string ElapsedTime;
        public ResultParameter()
        {
            Images = new List<BindingImage>();
            ElapsedTime = null;
        }
    }

    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    
    public partial class MainWindow : Window
    {
        private BackgroundWorker backgroundWorker, folderBackgroundWorker;
        private BindingList<BindingImage> ImageList;
        private OpenFileDialog ofd;
        public int ImagesCount = 0;
        private List<string> paths;
        System.Windows.Forms.FolderBrowserDialog folderBrowser;
        public MainWindow()
        {
            InitializeComponent();
            backgroundWorker = ((BackgroundWorker)this.FindResource("backgroundWorker"));
            folderBackgroundWorker = ((BackgroundWorker)this.FindResource("folderBackgroundWorker"));
            ImageList = new BindingList<BindingImage>();
            ofd = new OpenFileDialog();
            folderBrowser = new System.Windows.Forms.FolderBrowserDialog();
            this.ImageGrid.ItemsSource = ImageList;
            paths = new List<string>();
        }

        private void Button_Click(object sender, RoutedEventArgs e)
        {
            ofd.Filter = "All Supported Image Files|*.jpg;*.jpeg;*.jfif;*.tif;*.tiff;*.dib;*.rle;*.bmp;*.png;*.ico;*.gif;*.pcx;*.exif";
            ofd.ShowReadOnly = true;
            ofd.Multiselect = true;
            ofd.Title = "Выберите изображения";
            if (ofd.ShowDialog() == true)
                backgroundWorker.RunWorkerAsync(ofd);
        }
        public void AllImagesButton_Click(object sender, RoutedEventArgs e)
        {
            folderBrowser.Description ="Выберите папку,\n" +"в которой находятся файлы.";
            folderBrowser.ShowNewFolderButton = false;
            if (folderBrowser.ShowDialog() == System.Windows.Forms.DialogResult.OK)
                folderBackgroundWorker.RunWorkerAsync(folderBrowser);
        }
        private void DoWork(object sender, DoWorkEventArgs e)
        {
            OpenFileDialog backOfd = (OpenFileDialog)e.Argument;
            ResultParameter rp = new ResultParameter();
            int count = 0;
            double step = 100.0 / (double)backOfd.FileNames.Length;
            FileStream SourceStream = null;
            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();
            foreach (string FileName in backOfd.FileNames)
            {
                try
                {
                    paths.Add(FileName);
                    count++;
                    backgroundWorker.ReportProgress((int)(count * step), ofd.SafeFileNames[count - 1]);
                    SourceStream = File.Open(FileName, FileMode.Open);
                    if (ofd.SafeFileNames[count - 1].Split('.')[1] == "pcx")
                        rp.Images.Add(new BindingImage(++ImagesCount, backOfd.FileNames[count - 1], SourceStream));
                    else
                    {
                        System.Drawing.Image img = System.Drawing.Image.FromStream(SourceStream, false, false);
                        rp.Images.Add(new BindingImage(++ImagesCount, backOfd.FileNames[count - 1], img));
                    }
                }
                catch (Exception ex)
                {
                    
                }
                finally
                {
                    if (SourceStream != null)
                        SourceStream.Close();
                }
            }

            stopWatch.Stop();
            // Get the elapsed time as a TimeSpan value.
            TimeSpan ts = stopWatch.Elapsed;

            // Format and display the TimeSpan value.
            rp.ElapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
                ts.Hours, ts.Minutes, ts.Seconds,
                ts.Milliseconds / 10);
            e.Result = rp;
        }
        private void FolderDoWork(object sender, DoWorkEventArgs e)
        {
            string supportedExtensions = "*.jpg,*.jpeg,*.jfif,*.tif,*.tiff,*.dib,*.rle,*.bmp,*.png,*.ico,*.gif,*.pcx,*.exif";
            System.Windows.Forms.FolderBrowserDialog folder = (System.Windows.Forms.FolderBrowserDialog)e.Argument;
            String FilePath = folder.SelectedPath;
            String[] FileNames = System.IO.Directory.GetFiles(FilePath, "*.*", SearchOption.AllDirectories).Where(s => supportedExtensions.Contains(System.IO.Path.GetExtension(s).ToLower())).ToArray();
            
            //OpenFileDialog backOfd = new OpenFileDialog();
            ResultParameter rp = new ResultParameter();
            int count = 0;
            double step = 100.0 / (double)FileNames.Length;
            FileStream SourceStream = null;
            Stopwatch stopWatch = new Stopwatch();
            stopWatch.Start();
            foreach (string FileName in FileNames)
            {
                try
                {
                    paths.Add(FileName);
                    count++;
                    folderBackgroundWorker.ReportProgress((int)(count * step), FileNames[count - 1]);
                    SourceStream = File.Open(FileName, FileMode.Open);
                    if (FileName.Split('.')[1].ToLower() == "pcx")
                        rp.Images.Add(new BindingImage(++ImagesCount, FileNames[count - 1], SourceStream));
                    else
                    {
                        System.Drawing.Image img = System.Drawing.Image.FromStream(SourceStream, false, false);
                        rp.Images.Add(new BindingImage(++ImagesCount, FileNames[count - 1], img));
                    }
                }
                catch (Exception ex)
                {

                }
                finally
                {
                    if (SourceStream != null)
                        SourceStream.Close();
                }
            }

            stopWatch.Stop();
            // Get the elapsed time as a TimeSpan value.
            TimeSpan ts = stopWatch.Elapsed;

            // Format and display the TimeSpan value.
            rp.ElapsedTime = String.Format("{0:00}:{1:00}:{2:00}.{3:00}",
                ts.Hours, ts.Minutes, ts.Seconds,
                ts.Milliseconds / 10);
            e.Result = rp;
        }
        private void WorkDone(object sender, RunWorkerCompletedEventArgs e)
        {
            ResultParameter resultParameter = (ResultParameter)e.Result;
            foreach (BindingImage img in resultParameter.Images)
                ImageList.Add(img);
            int TotalImages = ofd.FileNames.Length;
            int Errors = TotalImages - resultParameter.Images.Count;
            StateBar.Value = 0;
            ProcessLabel.Text = "Complete! " + TotalImages + " new files loaded with " + Errors + " errors. " + "RunTime: " + resultParameter.ElapsedTime;
        }
        private void FolderWorkDone(object sender, RunWorkerCompletedEventArgs e)
        {
            ResultParameter resultParameter = (ResultParameter)e.Result;
            foreach (BindingImage img in resultParameter.Images)
                ImageList.Add(img);
            string supportedExtensions = "*.jpg,*.jpeg,*.jfif,*.tif,*.tiff,*.dib,*.rle,*.bmp,*.png,*.ico,*.gif,*.pcx,*.exif";
            int TotalImages = System.IO.Directory.GetFiles(folderBrowser.SelectedPath, "*.*", SearchOption.AllDirectories).Where(s => supportedExtensions.Contains(System.IO.Path.GetExtension(s).ToLower())).ToArray().Length;
            int Errors = TotalImages - resultParameter.Images.Count;
            StateBar.Value = 0;
            ProcessLabel.Text = "Complete! " + TotalImages + " new files loaded with " + Errors + " errors. " + "RunTime: " + resultParameter.ElapsedTime;
        }
        private void ProgressChanged(object sender, ProgressChangedEventArgs e)
        {
            ProcessLabel.Text = "Processing " + (string)e.UserState;
            if (e.ProgressPercentage > 100)
                StateBar.Value = 100;
            else
                StateBar.Value = e.ProgressPercentage;
        }

        private void ClearButton_Click(object sender, RoutedEventArgs e)
        {
            ImageList.Clear();
            ImagesCount = 0;
            ProcessLabel.Text = "Complete!";
            paths.Clear();
            if (image1.Source != null)
                image1.Source = null;
        }

        private void clickRow(object sender, MouseButtonEventArgs e)
        {
            if (ImageGrid.SelectedItem != null)
            {
                int index = ImageGrid.SelectedIndex;
                string format = ImageList[index].Format;
                               
                if (format == "Bmp" || format == "Jpg" || format == "Jpeg" || format == "Tiff" || format == "Png" || format == "Ico")
                {
                    image1.BeginInit();
                    BitmapImage bmi = new BitmapImage(new Uri(ImageList[index].Name));
                    bmi.CacheOption = BitmapCacheOption.OnLoad;
                    image1.Source = bmi;
                    image1.EndInit();
                }
            }
        }

        private void BackgroundWorker_DoWork(object sender, DoWorkEventArgs e)
        {

        }
    }
}
